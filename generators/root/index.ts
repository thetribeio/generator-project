import cryptoRandomString from 'crypto-random-string';
import Generator from 'yeoman-generator';
import run from '../../utils/run';

interface Prompt {
    repositoryName: string,
    contactEmail: string,
}

class RootGenerator extends Generator {
    #answers: Prompt|null = null;

    async prompting(): Promise<void> {
        this.#answers = await this.prompt([
            {
                type: 'input',
                name: 'repositoryName',
                message: 'Repository name',
                default: `thetribeio/${this.appname}`,
            },
            {
                type: 'input',
                name: 'contactEmail',
                message: 'Contact email',
            },
        ]);

        const { repositoryName } = this.#answers as Prompt;

        this.config.set('repositoryName', repositoryName);
    }

    writing() {
        const { contactEmail } = this.#answers as Prompt;

        const vaultPass = cryptoRandomString({ length: 64, type: 'ascii-printable' });

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(),
            { contactEmail },
            undefined,
            { globOptions: { dot: true } },
        );

        this.writeDestination('ansible/vault_pass.txt', `${vaultPass}\n`);
    }

    async install() {
        await run('git', ['init'], {
            cwd: this.destinationPath(),
        });
        await run('git', ['remote', 'add', 'origin', `git@github.com:${this.config.get('repositoryName')}.git`], {
            cwd: this.destinationPath(),
        });
        await run('git', ['submodule', 'add', 'git@github.com:thetribeio/ansible-roles.git', 'roles-lib'], {
            cwd: this.destinationPath('ansible'),
        });
    }
}

export default RootGenerator;
