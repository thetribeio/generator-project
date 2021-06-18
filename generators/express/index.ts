import cryptoRandomString from 'crypto-random-string';
import PackageGenerator from '../../utils/PackageGenerator';

interface Prompt {
    domain: string,
}

class ExpressGenerator extends PackageGenerator {
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

        // We use only alphanumeric characters in database password because special
        // characters often causes problems in configuration files
        const databasePassword = cryptoRandomString({ length: 64, type: 'alphanumeric' });

        this.renderTemplate('base', packagePath, undefined, undefined, { globOptions: { dot: true } });

        await this.configureDockerCompose('docker-compose.yaml.ejs');

        await this.configureCircleCI('circleci.yaml.ejs');

        await this.configureAnsible('ansible', {
            databasePassword,
            domain,
            repositoryName: this.config.get('repositoryName'),
        });

        await this.configureScripts('script');
    }
}

export default ExpressGenerator;
