import PackageGenerator from '../../utils/PackageGenerator';
import varName from '../../utils/varName';
import { DeploymentChoice } from '../root';

class CreateReactAppGenerator extends PackageGenerator {
    writing(): void {
        const projectName = this.config.get('projectName');
        const { packageName, packagePath } = this.options;

        this.renderTemplate('base', packagePath);

        this.renderTemplate('nginx.conf.ejs', `nginx/docker/packages/${packageName}.conf`);

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.configureCircleCI('circleci.yaml.ejs');

        switch (this.config.get('deployment')) {
            case DeploymentChoice.Ansible:
                this.configureAnsible('deployment/ansible', {
                    repositoryName: this.config.get('repositoryName'),
                });
                break;
            case DeploymentChoice.Kubernetes:
                // Add files required for docker build
                this.renderTemplate('deployment/kubernetes/docker', packagePath);

                // Update chart
                this.configureChart('deployment/kubernetes/chart');

                this.replaceDestination(
                    'modules/deployment/chart/values.yaml',
                    /$/s,
                    `\n${varName(packageName)}:\n  image:\n    tag: latest\n    digest: ~\n  sentry:\n    dsn: ~\n`,
                );

                this.writeTerraformVariable(
                    `${varName(packageName)}_sentry_dsn`,
                    'string',
                    '"" # TODO Add sentry DSN here',
                );
                this.writeTerraformVariable(`${varName(packageName)}_image_tag`, 'string', '"develop"');

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\ndata "docker_registry_image" "${varName(packageName)}" {\n    name = "\${var.registry}/${projectName}-${packageName}:\${var.${varName(packageName)}_image_tag}"\n}\n`,
                );

                this.writeReleaseVariable(
                    `${varName(packageName)}.image.digest`,
                    `data.docker_registry_image.${varName(packageName)}.sha256_digest`,
                );
                this.writeReleaseVariable(
                    `${varName(packageName)}.sentry.dsn`,
                    `var.${varName(packageName)}_sentry_dsn`,
                );
                break;
        }

        this.configureScripts('script');
    }

    async install(): Promise<void> {
        const { packagePath } = this.options;

        if (this.config.get('deployment') === DeploymentChoice.Kubernetes) {
            // Yeoman is loosing file permisions when writing
            await this.spawnCommand('chmod', ['a+x', `${packagePath}/start.sh`]);
        }
    }
}

export default CreateReactAppGenerator;
