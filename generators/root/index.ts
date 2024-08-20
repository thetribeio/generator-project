import cryptoRandomString from 'crypto-random-string';
import { createEncrypt } from '../../utils/ansible';
import BaseGenerator from '../../utils/BaseGenerator';
import { validateEmail, validateProjectName } from '../../utils/validation';

enum DeploymentChoice {
    Ansible = 'ansible',
    Kubernetes = 'kubernetes',
}

type Prompt = {
    projectName: string,
    repositoryName: string,
    domain: string,
    deployment: DeploymentChoice.Ansible,
    contactEmail: string,
} | {
    projectName: string,
    repositoryName: string,
    domain: string,
    deployment: DeploymentChoice.Kubernetes,
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
                type: 'list',
                name: 'deployment',
                message: 'Mode de déploiement',
                choices: [
                    {
                        name: 'Ansible',
                        value: DeploymentChoice.Ansible,
                    },
                    {
                        name: 'Kubernetes',
                        value: DeploymentChoice.Kubernetes,
                    },
                ],
                default: DeploymentChoice.Ansible,
            },
            {
                type: 'input',
                name: 'contactEmail',
                message: 'Contact email',
                validate: validateEmail,
                when: ({ deployment }: Prompt) => deployment === DeploymentChoice.Ansible,
            },
        ]);
    }

    writing(): void {
        this.renderTemplate('base', '.');

        switch (this.config.get<DeploymentChoice>('deployment')) {
            case DeploymentChoice.Ansible:
                if (!this.existsDestination('ansible/vault_pass.txt')) {
                    const vaultPass = cryptoRandomString({ length: 64, type: 'ascii-printable' });

                    this.writeDestination('ansible/vault_pass.txt', `${vaultPass}\n`);
                }

                this.renderTemplate('deployment/ansible', '.', {
                    basicAuthPassword: cryptoRandomString({ length: 16, type: 'ascii-printable' }),
                    contactEmail: this.config.get('contactEmail'),
                    domain: this.config.get('domain'),
                    encrypt: createEncrypt((this.readDestination('ansible/vault_pass.txt') as string).trim()),
                });
                break;
            case DeploymentChoice.Kubernetes:
                this.renderTemplate('deployment/kubernetes', '.', {
                    domain: this.config.get('domain'),
                });
                break;
        }
    }

    async install(): Promise<void> {
        // Yeoman is loosing file permisions when writing
        await this.spawn('chmod', ['a+x', 'script/bootstrap', 'script/server', 'script/update']);

        await this.spawn('git', ['init']);

        if (!(await this.#spawnTest('git', ['remote', 'get-url', 'origin']))) {
            await this.spawn(
                'git',
                [
                    'remote',
                    'add',
                    'origin',
                    `git@github.com:${this.config.get('repositoryName')}.git`,
                ],
            );
        }

        if (this.config.get('deployment') === DeploymentChoice.Ansible) {
            await this.spawn(
                'git',
                [
                    'update-index',
                    '--add',
                    '--cacheinfo',
                    '160000',
                    '0b0cd5d04c94e80cdb6fdaaad771d17feaec66d8',
                    'ansible/roles-lib',
                ],
            );
        }
    }

    /**
     * Variant of spawnCommand that emulate bash conditions.
     */
    async #spawnTest(command: string, args: string[]): Promise<boolean> {
        // @ts-ignore: the @types/yeoman-generator package doesn't have the right types for the spawnCommand function
        return (await this.spawn(command, args, { reject: false, stdio: 'ignore' })).exitCode === 0;
    }
}

export { DeploymentChoice };
export default RootGenerator;
