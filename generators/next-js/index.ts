import PackageGenerator from '../../utils/PackageGenerator';

class NextJSGenerator extends PackageGenerator {
    async writing() {
        const { packagePath } = this.options;
        this.renderTemplate('base', packagePath, undefined, undefined, { globOptions: { dot: true } });

        await this.configureDockerCompose('docker-compose.yaml.ejs');

        await this.configureCircleCI('circleci.yaml.ejs');

        await this.configureScripts('script');
    }
}

export default NextJSGenerator;
