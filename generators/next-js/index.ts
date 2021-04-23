import PackageGenerator from '../../utils/PackageGenerator';

class NextJSGenerator extends PackageGenerator {
    async writing() {
        const { packageName } = this.options;
        this.renderTemplate('base', packageName);
        await this.configureDockerCompose('docker-compose.yaml.ejs', { packageName });
    }

    async install(): Promise<void> {
        const { packageName } = this.options;

        await this.spawnCommand('yarn', ['install', '--frozen-lockfile'], { cwd: this.destinationPath(packageName) });
    }
}

export default NextJSGenerator;
