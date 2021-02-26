import ejs, { Data } from 'ejs';
import YAML, { Options } from 'yaml';
import Generator, { GeneratorOptions } from 'yeoman-generator';
import { createEncrypt } from './ansible';
import { Config, mergeConfig } from './circleci';
import indent from './indent';

interface PackageGeneratorOptions extends GeneratorOptions {
    packageName: string;
}

class PackageGenerator extends Generator<PackageGeneratorOptions> {
    constructor(args: string | string[], opts: PackageGeneratorOptions) {
        super(args, opts);

        this.argument('packageName', { type: String, required: true });

        if (!/^[a-z0-9-]+$/.test(this.options.name)) {
            throw new Error('Package name can only contains lowercase numbers, numbers and dashes');
        }
    }

    async configureDockerCompose(templatePath: string, context: Data) {
        await this.extendYAML(
            templatePath,
            'docker-compose.yaml',
            context,
            (oldConfig, config) => ({
                ...oldConfig,
                services: {
                    ...oldConfig.services,
                    ...config.services,
                },
            }),
            { indent: 4 },
        );
    }

    async configureCircleCI(templatePath: string, context: Data) {
        await this.extendYAML(
            templatePath,
            '.circleci/config.yml',
            context,
            (oldConfig, config) => mergeConfig(Config.fromRaw(oldConfig), Config.fromRaw(config)).toRaw(),
            { indent: 2 },
        );
    }

    async configureAnsible(templatePath: string, context: Data): Promise<void> {
        const extendedContext = {
            encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
            ...context,
        };

        const paths = ['deployment.yaml', 'provision.yaml', 'group_vars/all.yaml', 'group_vars/staging.yaml'];

        await Promise.all(paths.map(async (path: string): Promise<void> => {
            await this.appendTemplate(`${templatePath}/${path}.ejs`, `ansible/${path}`, extendedContext);
        }));
    }

    private async appendTemplate(from: string, to: string, context: Data): Promise<void> {
        this.fs.append(this.destinationPath(to), await this.renderTemplateToString(from, context));
    }

    private async extendYAML(
        template: string,
        destination: string,
        context: Data,
        merger: (a: any, b: any) => any,
        options: Options = {},
    ): Promise<void> {
        const config = YAML.parse(await this.renderTemplateToString(template, context));

        const oldConfig = YAML.parse(this.readDestination(destination));

        const newConfig = merger(oldConfig, config);

        this.writeDestination(destination, YAML.stringify(newConfig, options));
    }

    private renderTemplateToString(path: string, context: Data): Promise<string> {
        return ejs.renderFile(this.templatePath(path), { indent, ...context });
    }
}

export default PackageGenerator;
