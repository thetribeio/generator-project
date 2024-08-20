import PackageGenerator from '../../utils/PackageGenerator';

class FastApiGenerator extends PackageGenerator {
    async initializing(): Promise<void> {
        const { packageName } = this.options;

        await this.composeWith(require.resolve('../utils/database'), [packageName]);
    }

    writing(): void {
        const { packagePath } = this.options;

        this.renderTemplate('base', packagePath);

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.configureAnsible('ansible', {
            repositoryName: this.config.get('repositoryName'),
        });
    }
}

export default FastApiGenerator;
