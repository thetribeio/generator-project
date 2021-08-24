import PackageGenerator from '../../utils/PackageGenerator';

interface Prompt {
    domain: string,
}

class NextJSGenerator extends PackageGenerator {
    #answers: Prompt|null = null;

    async prompting() {
        const { packageName } = this.options;
        const projectName = this.config.get('projectName');

        this.#answers = await this.prompt([
            {
                type: 'input',
                name: 'domain',
                message: `The domain for ${packageName}`,
                default: `${packageName}.${projectName}.thetribe.io`,
            },
        ]);
    }

    async writing() {
        const { packagePath } = this.options;
        const { domain } = this.#answers as Prompt;
        this.renderTemplate('base', packagePath, undefined, undefined, { globOptions: { dot: true } });

        await this.configureDockerCompose('docker-compose.yaml.ejs');

        await this.configureCircleCI('circleci.yaml.ejs');

        await this.configureAnsible('ansible', {
            domain,
            repositoryName: this.config.get('repositoryName'),
        });

        await this.configureScripts('script');
    }
}

export default NextJSGenerator;
