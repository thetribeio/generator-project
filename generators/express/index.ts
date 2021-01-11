import { Vault } from 'ansible-vault';
import cryptoRandomString from 'crypto-random-string';
import { GeneratorOptions } from 'yeoman-generator';
import BaseGenerator from '../../utils/BaseGenerator';

interface Prompt {
    domain: string,
}

class ExpressGenerator extends BaseGenerator {
    #answers: Prompt|null = null;

    constructor(args: string | string[], opts: GeneratorOptions) {
        super(args, opts);

        this.argument('name', { type: String, required: true });

        if (!/^[a-z0-9-]+$/.test(this.options.name)) {
            throw new Error('Name argument can only contains lowercase numbers, numbers and dashes');
        }
    }

    async prompting() {
        const { name } = this.options;

        this.#answers = await this.prompt([
            {
                type: 'input',
                name: 'domain',
                message: `The domain for ${name}`,
                default: `${name}.${this.appname}.thetribe.io`,
            },
        ]);
    }

    async writing() {
        const { name } = this.options;
        const { domain } = this.#answers as Prompt;

        const vault = new Vault({ password: this.readDestination('ansible/vault_pass.txt') });

        // We use only alphanumeric characters in database password because special
        // characters often causes problems in configuration files
        const databasePassword = cryptoRandomString({ length: 64, type: 'alphanumeric' });

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(name),
            {
                name,
                projectName: this.config.get('projectName'),
            },
            undefined,
            { globOptions: { dot: true } },
        );

        await this.configureDockerCompose('docker-compose.yaml.ejs', { name });

        await this.configureCircleCI('circleci.yaml.ejs', {
            name,
            projectName: this.config.get('projectName'),
        });

        await this.configureAnsible('ansible', {
            databasePassword: await vault.encrypt(databasePassword),
            domain,
            name,
            repositoryName: this.config.get('repositoryName'),
        });
    }

    install(): void {
        const { name } = this.options;

        this.yarnInstall(undefined, { frozenLockfile: true }, { cwd: this.destinationPath(name) });
    }
}

export default ExpressGenerator;
