import ejs, { Data as TemplateData, Options as TemplateOptions } from 'ejs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CopyOptions } from 'mem-fs-editor';
import YAML, { Options } from 'yaml';
import { strOptions } from 'yaml/types';
import Generator, { GeneratorOptions } from 'yeoman-generator';
import { createEncrypt } from './ansible';
import { Config, mergeConfig } from './circleci';
import indent from './indent';

strOptions.fold.lineWidth = 0;

interface PackageGeneratorOptions extends GeneratorOptions {
    packageName: string;
}

class PackageGenerator<T extends PackageGeneratorOptions = PackageGeneratorOptions> extends Generator<T> {
    constructor(args: string | string[], opts: T) {
        super(args, opts);

        this.argument('packageName', { type: String, required: true });

        if (!/^[a-z0-9-]+$/.test(this.options.name)) {
            throw new Error('Package name can only contains lowercase numbers, numbers and dashes');
        }
    }

    renderTemplate(
        source: string | string[],
        destination?: string | string[],
        context: TemplateData = {},
        templateOptions?: TemplateOptions | string,
        copyOptions?: CopyOptions,
    ): void {
        super.renderTemplate(source, destination, this.getContext(context), templateOptions, copyOptions);
    }

    async configureDockerCompose(templatePath: string, context: TemplateData = {}) {
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

    async configureCircleCI(templatePath: string, context: TemplateData = {}) {
        await this.extendYAML(
            templatePath,
            '.circleci/config.yml',
            context,
            (oldConfig, config) => mergeConfig(Config.fromRaw(oldConfig), Config.fromRaw(config)).toRaw(),
            { indent: 2 },
        );
    }

    async configureAnsible(templatePath: string, context: TemplateData = {}): Promise<void> {
        const extendedContext = {
            encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
            ...context,
        };

        const paths = ['deployment.yaml', 'provision.yaml', 'group_vars/all.yaml', 'group_vars/staging.yaml'];

        await Promise.all(paths.map(async (path: string): Promise<void> => {
            await this.appendTemplate(`${templatePath}/${path}.ejs`, `ansible/${path}`, extendedContext);
        }));
    }

    private async appendTemplate(from: string, to: string, context: TemplateData): Promise<void> {
        this.fs.append(this.destinationPath(to), await this.renderTemplateToString(from, context));
    }

    private async extendYAML(
        template: string,
        destination: string,
        context: TemplateData,
        merger: (a: any, b: any) => any,
        options: Options = {},
    ): Promise<void> {
        const config = YAML.parse(await this.renderTemplateToString(template, context));

        const oldConfig = YAML.parse(this.readDestination(destination));

        const newConfig = merger(oldConfig, config);

        this.writeDestination(destination, YAML.stringify(newConfig, options));
    }

    private renderTemplateToString(path: string, context: TemplateData): Promise<string> {
        return ejs.renderFile(this.templatePath(path), this.getContext(context));
    }

    private getContext(context: TemplateData): TemplateData {
        return {
            indent,
            packageName: this.options.packageName,
            projectName: this.config.get('projectName'),
            ...context,
        };
    }
}

export type { PackageGeneratorOptions };
export default PackageGenerator;
