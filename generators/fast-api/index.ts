import createResolve from '../../utils/createResolve';
import PackageGenerator from '../../utils/PackageGenerator';

const resolve = createResolve(import.meta);

class FastApiGenerator extends PackageGenerator {
    initializing(): void {
        const { packageName } = this.options;

        this.composeWith(resolve('../utils/database'), [packageName]);
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
