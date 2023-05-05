import cryptoRandomString from 'crypto-random-string';
import indent from 'indent-tag';
import { Question } from 'yeoman-generator';
import { createEncrypt } from '../../utils/ansible';
import PackageGenerator from '../../utils/PackageGenerator';
import varName from '../../utils/varName';
import { DeploymentChoice } from '../root';

interface Prompt {
    twig: boolean,
}

const prompt: Question<Prompt>[] = [
    {
        type: 'confirm',
        name: 'twig',
        message: 'Would you like to add twig to the Symfony backend?',
        default: false,
    },
];

class SymfonyGenerator extends PackageGenerator {
    initializing(): void {
        const { 'http-path': httpPath, packageName } = this.options;

        this.composeWith(require.resolve('../utils/database'), [packageName]);
        this.composeWith(require.resolve('../utils/http'), [packageName, httpPath, 80]);
    }

    async prompting(): Promise<void> {
        await this.promptConfig<Prompt>(prompt);
    }

    writing(): void {
        const projectName = this.config.get('projectName');
        const twig = this.config.get('twig');
        const { packageName, packagePath } = this.options;

        this.renderTemplate('base', packagePath);

        this.renderTemplate(
            twig ? 'nginx-twig.conf.ejs' : 'nginx.conf.ejs',
            `nginx/docker/packages/${packageName}.conf`,
        );

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.renderTemplate('actions', '.github/actions');
        this.renderTemplate('workflow.yaml.ejs', `.github/workflows/${packageName}.yaml`, { twig });

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
            case DeploymentChoice.Kubernetes: {
                const packageVar = varName(packageName);

                // Add files required for docker build
                this.renderTemplate('deployment/kubernetes/docker', packagePath, { twig });

                // Update chart
                this.configureChart('deployment/kubernetes/chart');

                this.appendDestination('modules/deployment/chart/values.yaml', indent`

                    ${packageVar}:
                      image:
                        tag: latest
                        digests:
                          nginx: ~
                          php: ~
                      sentry:
                        dsn: ~
                      database:
                        host: ~
                        port: ~
                        user: ~
                        password: ~
                        name: ~
                      app:
                        secret: ~
                `);

                this.writeTerraformVariable(`${packageVar}_sentry_dsn`, 'string', '"" # TODO Add sentry DSN here');
                this.writeTerraformVariable(`${packageVar}_image_tag`, 'string', '"develop"');

                this.appendDestination('modules/deployment/release.tf', indent`

                    data "docker_registry_image" "${packageVar}_nginx" {
                        name = "\${var.registry}/${projectName}-${packageName}-nginx:\${var.${packageVar}_image_tag}"
                    }
                `);

                this.appendDestination('modules/deployment/release.tf', indent`

                    data "docker_registry_image" "${packageVar}_php" {
                        name = "\${var.registry}/${projectName}-${packageName}-php:\${var.${packageVar}_image_tag}"
                    }
                `);

                this.writeReleaseVariable(`${packageVar}.image.digests.nginx`, `data.docker_registry_image.${packageVar}_nginx.sha256_digest`);
                this.writeReleaseVariable(`${packageVar}.image.digests.php`, `data.docker_registry_image.${packageVar}_php.sha256_digest`);
                this.writeReleaseVariable(`${packageVar}.sentry.dsn`, `var.${packageVar}_sentry_dsn`);

                this.appendDestination('modules/deployment/release.tf', indent`

                    resource "random_password" "${packageVar}_app_secret" {
                        length = 32
                    }
                `);
                this.writeReleaseVariable(`${packageVar}.app.secret`, `random_password.${packageVar}_app_secret.result`);
                break;
            }
        }

        this.configureScripts('script', { twig });
    }
}

export default SymfonyGenerator;
