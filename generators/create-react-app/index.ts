import PackageGenerator from '../../utils/PackageGenerator';

interface Prompt {
    domain: string,
}

class CreateReactAppGenerator extends PackageGenerator {
    #answers: Prompt|null = null;

    async prompting() {
        const { packageName } = this.options;

        this.#answers = await this.prompt([
            {
                type: 'input',
                name: 'domain',
                message: `The domain for ${packageName}`,
                default: `${packageName}.${this.appname}.thetribe.io`,
            },
        ]);
    }

    async writing(): Promise<void> {
        const { packageName } = this.options;
        const { domain } = this.#answers as Prompt;

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(packageName),
            { packageName },
            undefined,
            { globOptions: { dot: true } },
        );

        await this.configureDockerCompose('docker-compose.yaml.ejs', { packageName });

        await this.configureCircleCI('circleci.yaml.ejs', {
            packageName,
            projectName: this.config.get('projectName'),
        });

        await this.configureAnsible('ansible', {
            domain,
            packageName,
            repositoryName: this.config.get('repositoryName'),
        });
    }

    install(): void {
        const { packageName } = this.options;

        this.yarnInstall(undefined, { frozenLockfile: true }, { cwd: this.destinationPath(packageName) });
    }
}

export default CreateReactAppGenerator;
