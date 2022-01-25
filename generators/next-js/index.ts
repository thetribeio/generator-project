import PackageGenerator from '../../utils/PackageGenerator';
import { DeploymentChoice } from '../root';

class NextJSGenerator extends PackageGenerator {
    writing(): void {
        const { packageName, packagePath } = this.options;

        this.renderTemplate('base', packagePath);

        this.renderTemplate('nginx.conf.ejs', `nginx/docker/packages/${packageName}.conf`);

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.configureCircleCI('circleci.yaml.ejs');

        switch (this.config.get('deployment')) {
            case DeploymentChoice.Ansible:
                this.configureAnsible('ansible', {
                    repositoryName: this.config.get('repositoryName'),
                });
                break;
            case DeploymentChoice.Kubernetes:
                throw new Error('The NextJS generator is not yet compatible with kubernetes deployment');
        }

        this.configureScripts('script');
    }
}

export default NextJSGenerator;
