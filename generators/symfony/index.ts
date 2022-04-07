import cryptoRandomString from 'crypto-random-string';
import { createEncrypt } from '../../utils/ansible';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';
import varName from '../../utils/varName';
import { DeploymentChoice } from '../root';

interface Options extends PackageGeneratorOptions {
    twig: boolean;
}

class SymfonyGenerator extends PackageGenerator<Options> {
    constructor(args: string | string[], opts: Options) {
        super(args, opts);

        this.option('twig', { type: Boolean });
    }

    initializing(): void {
        const { packageName } = this.options;

        this.composeWith(require.resolve('../utils/database'), [packageName]);
    }

    writing(): void {
        const projectName = this.config.get('projectName');
        const { packageName, packagePath, twig } = this.options;

        this.renderTemplate('base', packagePath);

        this.renderTemplate(
            twig ? 'nginx-twig.conf.ejs' : 'nginx.conf.ejs',
            `nginx/docker/packages/${packageName}.conf`,
        );

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.configureCircleCI('circleci.yaml.ejs', { twig });

        if (twig) {
            this.renderTemplate('base-twig', packagePath);

            this.configureDockerCompose('docker-compose-twig.yaml.ejs');
        }

        switch (this.config.get('deployment')) {
            case DeploymentChoice.Ansible:
                this.configureAnsible('deployment/ansible', {
                    encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
                    repositoryName: this.config.get('repositoryName'),
                    secret: cryptoRandomString({ length: 64, type: 'alphanumeric' }),
                    twig,
                });

                this.updateCircleCIConfig((config) => {
                    config.workflows.build.jobs.deploy.requires.push(`${packageName}-build`);
                });
                break;
            case DeploymentChoice.Kubernetes:
                // Add files required for docker build
                this.renderTemplate('deployment/kubernetes/docker', packagePath, { twig });

                // Update chart
                this.configureChart('deployment/kubernetes/chart');

                this.replaceDestination(
                    'modules/deployment/chart/values.yaml',
                    /$/s,
                    `\n${varName(packageName)}:\n  image:\n    tag: latest\n    digests:\n      nginx: ~\n      php: ~\n  sentry:\n    dsn: ~\n  database:\n    host: ~\n    port: ~\n    user: ~\n    password: ~\n    name: ~\n  app:\n    secret: ~\n`,
                );

                this.writeTerraformVariable(`${varName(packageName)}_sentry_dsn`, 'string', '"" # TODO Add sentry DSN here');
                this.writeTerraformVariable(`${varName(packageName)}_image_tag`, 'string', '"develop"');

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\ndata "docker_registry_image" "${varName(packageName)}_nginx" {\n    name = "\${var.registry}/${projectName}-${packageName}-nginx:\${var.${varName(packageName)}_image_tag}"\n}\n`,
                );

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\ndata "docker_registry_image" "${varName(packageName)}_php" {\n    name = "\${var.registry}/${projectName}-${packageName}-php:\${var.${varName(packageName)}_image_tag}"\n}\n`,
                );

                this.writeReleaseVariable(`${varName(packageName)}.image.digests.nginx`, `data.docker_registry_image.${varName(packageName)}_nginx.sha256_digest`);
                this.writeReleaseVariable(`${varName(packageName)}.image.digests.php`, `data.docker_registry_image.${varName(packageName)}_php.sha256_digest`);
                this.writeReleaseVariable(`${varName(packageName)}.sentry.dsn`, `var.${varName(packageName)}_sentry_dsn`);

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\nresource "random_password" "${varName(packageName)}_app_secret" {\n    length = 32\n}\n`,
                );
                this.writeReleaseVariable(`${varName(packageName)}.app.secret`, `random_password.${varName(packageName)}_app_secret.result`);
                break;
        }

        this.configureScripts('script', { twig });
    }
}

export default SymfonyGenerator;
