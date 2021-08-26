import PackageGenerator from '../../utils/PackageGenerator';

class CreateReactAppGenerator extends PackageGenerator {
    async writing(): Promise<void> {
        const { packageName, packagePath } = this.options;

        this.renderTemplate('base', packagePath, undefined, undefined, { globOptions: { dot: true } });

        this.renderTemplate('nginx.conf.ejs', `nginx/docker/packages/${packageName}.conf`);

        await this.configureDockerCompose('docker-compose.yaml.ejs');

        await this.configureCircleCI('circleci.yaml.ejs');

        await this.configureAnsible('ansible', {
            repositoryName: this.config.get('repositoryName'),
        });

        await this.configureScripts('script');
    }
}

export default CreateReactAppGenerator;
