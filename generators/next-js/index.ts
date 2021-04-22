import PackageGenerator from '../../utils/PackageGenerator';

class NextJSGenerator extends PackageGenerator {
    async writing() {
        const { packageName } = this.options;
        this.renderTemplate('base', packageName);
        await this.configureDockerCompose('docker-compose.yaml.ejs', { packageName });
    }
}

export default NextJSGenerator;
