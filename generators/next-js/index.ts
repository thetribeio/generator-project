import indent from 'indent-tag';
import PackageGenerator from '../../utils/PackageGenerator';
import varName from '../../utils/varName';
import { DeploymentChoice } from '../root';

class NextJSGenerator extends PackageGenerator {
    initializing(): void {
        const { 'http-path': httpPath, packageName } = this.options;

        this.composeWith(require.resolve('../utils/http'), [packageName, httpPath, 3000]);
    }

    writing(): void {
        const { packageName, packagePath } = this.options;
        const projectName = this.config.get('projectName');

        this.renderTemplate('base', packagePath);
        this.destination[`${packagePath}/package.json`].name = packageName;

        this.renderTemplate('nginx.conf.ejs', `nginx/docker/packages/${packageName}.conf`);

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.configureCircleCI('circleci.yaml.ejs');

        switch (this.config.get('deployment')) {
            case DeploymentChoice.Ansible:
                this.configureAnsible('deployment/ansible', {
                    repositoryName: this.config.get('repositoryName'),
                });

                this.updateCircleCIConfig((config) => {
                    config.workflows.build!.jobs.deploy!.requires.push(`${packageName}-archive`);
                });
                break;
            case DeploymentChoice.Kubernetes: {
                const packageVar = varName(packageName);

                // Add files required for docker build
                this.renderTemplate('deployment/kubernetes/docker', packagePath);

                // Update chart
                this.configureChart('deployment/kubernetes/chart');

                this.appendDestination('modules/deployment/chart/values.yaml', indent`

                    ${packageVar}:
                      image:
                        tag: latest
                        digest: ~
                      sentry:
                        dsn: ~
                `);

                this.writeTerraformVariable(`${packageVar}_sentry_dsn`, 'string', '"" # TODO Add sentry DSN here');
                this.writeTerraformVariable(`${packageVar}_image_tag`, 'string', '"develop"');

                this.appendDestination('modules/deployment/release.tf', indent`

                    data "docker_registry_image" "${packageVar}" {
                        name = "\${var.registry}/${projectName}/${packageName}:\${var.${packageVar}_image_tag}"
                    }
                `);

                this.writeReleaseVariable(`${packageVar}.image.digest`, `data.docker_registry_image.${packageVar}.sha256_digest`);
                this.writeReleaseVariable(`${packageVar}.sentry.dsn`, `var.${packageVar}_sentry_dsn`);
                break;
            }
        }

        this.configureScripts('script');
    }
}

export default NextJSGenerator;
