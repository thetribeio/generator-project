import cryptoRandomString from 'crypto-random-string';
import Generator from 'yeoman-generator';
import { validateProjectName } from '../../utils/validation';

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
                default: this.appname.replace(/ /g, '-'),
                validate: validateProjectName,
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

    async install(): Promise<void> {
        // Yeoman is loosing file permisions when writing
        await this.spawnCommand('chmod', ['a+x', 'script/bootstrap', 'script/server', 'script/update']);

        await this.spawnCommand('git', ['init']);

        if (!(await this.#spawnTest('git', ['remote', 'get-url', 'origin']))) {
            await this.spawnCommand('git', ['remote', 'add', 'origin', `git@github.com:${this.config.get('repositoryName')}.git`]);
        }

        if (!(await this.#spawnTest('git', ['submodule', 'status', 'ansible/roles-lib']))) {
            await this.spawnCommand('git', ['submodule', 'add', 'git@github.com:thetribeio/ansible-roles.git', 'ansible/roles-lib']);
        }
    }

    /**
     * Variant of spawnCommand that emulate bash conditions.
     */
    async #spawnTest(command: string, args: string[]): Promise<boolean> {
        // @ts-ignore: the @types/yeoman-generator package doesn't have the right types for the spawnCommand function
        return (await this.spawnCommand(command, args, { reject: false, stdio: 'ignore' })).exitCode === 0;
    }
}

export default RootGenerator;
