import cryptoRandomString from 'crypto-random-string';
import execa from 'execa';
import Generator from 'yeoman-generator';

interface Prompt {
    projectName: string,
    repositoryName: string,
    contactEmail: string,
}

class RootGenerator extends Generator {
    #answers: Prompt|null = null;

    async prompting(): Promise<void> {
        this.#answers = await this.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'Project name',
                default: this.appname,
            },
            {
                type: 'input',
                name: 'repositoryName',
                message: 'Repository name',
                default: ({ projectName }: Prompt) => `thetribeio/${projectName}`,
            },
            {
                type: 'input',
                name: 'contactEmail',
                message: 'Contact email',
            },
        ]);

        const { projectName, repositoryName } = this.#answers as Prompt;

        this.config.set('projectName', projectName);
        this.config.set('repositoryName', repositoryName);
    }

    writing() {
        const { contactEmail } = this.#answers as Prompt;

        const vaultPass = cryptoRandomString({ length: 64, type: 'ascii-printable' });

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(),
            {
                contactEmail,
                projectName: this.config.get('projectName'),
            },
            undefined,
            { globOptions: { dot: true } },
        );

        this.writeDestination('ansible/vault_pass.txt', `${vaultPass}\n`);
    }

    async install() {
        await execa('git', ['init'], {
            cwd: this.destinationPath(),
        });
        await execa('git', ['remote', 'add', 'origin', `git@github.com:${this.config.get('repositoryName')}.git`], {
            cwd: this.destinationPath(),
        });
        await execa('git', ['submodule', 'add', 'git@github.com:thetribeio/ansible-roles.git', 'roles-lib'], {
            cwd: this.destinationPath('ansible'),
        });
    }
}

export default RootGenerator;
