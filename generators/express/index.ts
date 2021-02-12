import cryptoRandomString from 'crypto-random-string';
import { encrypt } from '../../utils/ansible';
import PackageGenerator from '../../utils/PackageGenerator';

interface Prompt {
    domain: string,
}

class ExpressGenerator extends PackageGenerator {
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

    async writing() {
        const { packageName } = this.options;
        const { domain } = this.#answers as Prompt;

        const vaultPass = this.readDestination('ansible/vault_pass.txt');

        // We use only alphanumeric characters in database password because special
        // characters often causes problems in configuration files
        const databasePassword = cryptoRandomString({ length: 64, type: 'alphanumeric' });

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(packageName),
            {
                packageName,
                projectName: this.config.get('projectName'),
            },
            undefined,
            { globOptions: { dot: true } },
        );

        await this.configureDockerCompose('docker-compose.yaml.ejs', { packageName });

        await this.configureCircleCI('circleci.yaml.ejs', {
            packageName,
            projectName: this.config.get('projectName'),
        });

        await this.configureAnsible('ansible', {
            databasePassword: await encrypt(vaultPass, databasePassword),
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

export default ExpressGenerator;
