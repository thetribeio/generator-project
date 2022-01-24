import cryptoRandomString from 'crypto-random-string';
import { createEncrypt } from '../../utils/ansible';
import BaseGenerator from '../../utils/BaseGenerator';
import { validateEmail, validateProjectName } from '../../utils/validation';

interface Prompt {
    projectName: string,
    repositoryName: string,
    domain: string,
    contactEmail: string,
}

class RootGenerator extends BaseGenerator {
    async prompting(): Promise<void> {
        await this.promptConfig([
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
                name: 'domain',
                message: 'Staging domain',
                default: ({ projectName }: Prompt) => `${projectName}.thestaging.io`,
            },
            {
                type: 'input',
                name: 'contactEmail',
                message: 'Contact email',
                validate: validateEmail,
            },
        ]);
    }

    writing(): void {
        if (!this.existsDestination('ansible/vault_pass.txt')) {
            const vaultPass = cryptoRandomString({ length: 64, type: 'ascii-printable' });

            this.writeDestination('ansible/vault_pass.txt', `${vaultPass}\n`);
        }

        this.renderTemplate('base', '.', {
            basicAuthPassword: cryptoRandomString({ length: 16, type: 'ascii-printable' }),
            contactEmail: this.config.get('contactEmail'),
            domain: this.config.get('domain'),
            encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
            projectName: this.config.get('projectName'),
        });
    }

    async install(): Promise<void> {
        // Yeoman is loosing file permisions when writing
        await this.spawnCommand('chmod', ['a+x', 'script/bootstrap', 'script/server', 'script/update']);

        await this.spawnCommand('git', ['init']);

        if (!(await this.#spawnTest('git', ['remote', 'get-url', 'origin']))) {
            await this.spawnCommand(
                'git',
                [
                    'remote',
                    'add',
                    'origin',
                    `git@github.com:${this.config.get('repositoryName')}.git`,
                ],
            );
        }

        await this.spawnCommand(
            'git',
            [
                'update-index',
                '--add',
                '--cacheinfo',
                '160000',
                '4d1ffdcd4bc254bcc61fd85fc176d07b64d2d464',
                'ansible/roles-lib',
            ],
        );
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
