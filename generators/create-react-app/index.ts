import PackageGenerator from '../../utils/PackageGenerator';

class CreateReactAppGenerator extends PackageGenerator {
    writing(): void {
        const { packageName, packagePath } = this.options;

        this.renderTemplate('base', packagePath);

        this.renderTemplate('nginx.conf.ejs', `nginx/docker/packages/${packageName}.conf`);

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.configureCircleCI('circleci.yaml.ejs');

        this.configureAnsible('ansible', {
            repositoryName: this.config.get('repositoryName'),
        });

        this.configureScripts('script');
    }
}

export default CreateReactAppGenerator;
