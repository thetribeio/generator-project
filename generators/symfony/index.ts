import cryptoRandomString from 'crypto-random-string';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';
import run from '../../utils/run';

interface Options extends PackageGeneratorOptions {
    twig: boolean;
}

interface Prompt {
    domain: string,
}

class SymfonyGenerator extends PackageGenerator<Options> {
    #answers: Prompt|null = null;

    constructor(args: string | string[], opts: Options) {
        super(args, opts);

        this.option('twig', { type: Boolean });
    }

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

    async writing() {
        const { packageName } = this.options;
        const { domain } = this.#answers as Prompt;

        // We use only alphanumeric characters in database password because special
        // characters often causes problems in configuration files
        const databasePassword = cryptoRandomString({ length: 64, type: 'alphanumeric' });

        this.renderTemplate('base', packageName, undefined, undefined, { globOptions: { dot: true } });

        await this.configureDockerCompose('docker-compose.yaml.ejs');

        await this.configureCircleCI('circleci.yaml.ejs');

        if (this.options.twig) {
            this.renderTemplate('base-twig', packageName, undefined, undefined, { globOptions: { dot: true } });

            await this.configureDockerCompose('docker-compose-twig.yaml.ejs');

            await this.configureCircleCI('circleci-twig.yaml.ejs');
        }

        await this.configureAnsible('ansible', {
            databasePassword,
            domain,
            repositoryName: this.config.get('repositoryName'),
            twig: this.options.twig,
        });
    }

    async install(): Promise<void> {
        const { packageName } = this.options;

        await run('composer', ['install', '--ignore-platform-reqs', '--no-scripts'], { cwd: this.destinationPath(packageName) });

        if (this.options.twig) {
            this.yarnInstall(undefined, { frozenLockfile: true }, { cwd: this.destinationPath(packageName) });
        }
    }
}

export default SymfonyGenerator;
