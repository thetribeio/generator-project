import PackageGenerator from '../../utils/PackageGenerator';
import varify from '../../utils/varify';
import { DeploymentChoice } from '../root';

class NextJSGenerator extends PackageGenerator {
    writing(): void {
        const { packageName, packagePath } = this.options;
        const projectName = this.config.get('projectName');

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
                    `\n${varify(packageName)}:\n  image:\n    tag: latest\n    digest: ~\n  sentry:\n    dsn: ~\n`,
                );

                this.writeTerraformVariable(`${varify(packageName)}_sentry_dsn`, 'string', '"" # TODO Add sentry DSN here');
                this.writeTerraformVariable(`${varify(packageName)}_image_tag`, 'string', '"develop"');

                this.replaceDestination(
                    'modules/deployment/release.tf',
                    /$/s,
                    `\ndata "docker_registry_image" "${varify(packageName)}" {\n    name = "\${var.registry}/${projectName}-${packageName}:\${var.${varify(packageName)}_image_tag}"\n}\n`,
                );

                this.writeReleaseVariable(`${varify(packageName)}.image.digest`, `data.docker_registry_image.${varify(packageName)}.sha256_digest`);
                this.writeReleaseVariable(`${varify(packageName)}.sentry.dsn`, `var.${varify(packageName)}_sentry_dsn`);
                break;
        }

        this.configureScripts('script');
    }
}

export default NextJSGenerator;
