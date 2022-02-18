import cryptoRandomString from 'crypto-random-string';
import { createEncrypt } from '../../utils/ansible';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';
import varify from '../../utils/varify';
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
                break;
            case DeploymentChoice.Kubernetes:
                // Add files required for docker build
                this.renderTemplate('deployment/kubernetes/docker', packagePath, { twig });

                // Update chart
                this.configureChart('deployment/kubernetes/chart');

                this.replaceDestination(
                    'modules/deployment/chart/values.yaml',
                    /$/s,
                    `\n${varify(packageName)}:\n  image:\n    tag: latest\n    digests:\n      nginx: ~\n      php: ~\n  sentry:\n    dsn: ~\n  database:\n    host: ~\n    port: ~\n    user: ~\n    password: ~\n    name: ~\n  app:\n    secret: ~\n`,
                );

                this.writeTerraformVariable(`${varify(packageName)}_sentry_dsn`, 'string', '"" # TODO Add sentry DSN here');
                this.writeTerraformVariable(`${varify(packageName)}_image_tag`, 'string', '"develop"');

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\ndata "docker_registry_image" "${varify(packageName)}_nginx" {\n    name = "\${var.registry}/${projectName}-${packageName}-nginx:\${var.${varify(packageName)}_image_tag}"\n}\n`,
                );

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\ndata "docker_registry_image" "${varify(packageName)}_php" {\n    name = "\${var.registry}/${projectName}-${packageName}-php:\${var.${varify(packageName)}_image_tag}"\n}\n`,
                );

                this.writeReleaseVariable(`${varify(packageName)}.image.digests.nginx`, `data.docker_registry_image.${varify(packageName)}_nginx.sha256_digest`);
                this.writeReleaseVariable(`${varify(packageName)}.image.digests.php`, `data.docker_registry_image.${varify(packageName)}_php.sha256_digest`);
                this.writeReleaseVariable(`${varify(packageName)}.sentry.dsn`, `var.${varify(packageName)}_sentry_dsn`);

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\nresource "random_password" "${varify(packageName)}_app_secret" {\n    length = 32\n}\n`,
                );
                this.writeReleaseVariable(`${varify(packageName)}.app.secret`, `random_password.${varify(packageName)}_app_secret.result`);
                break;
        }

        this.configureScripts('script', { twig });
    }
}

export default SymfonyGenerator;
