import fs from 'fs';
import ejs, { Data as TemplateData, Options as TemplateOptions } from 'ejs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CopyOptions } from 'mem-fs-editor';
import YAML, { Options } from 'yaml';
import { strOptions } from 'yaml/types';
import { GeneratorOptions } from 'yeoman-generator';
import { createEncrypt } from './ansible';
import BaseGenerator from './BaseGenerator';
import { Config, mergeConfig } from './circleci';
import indent from './indent';
import validateProjectPath from './validation/validatePackagePath';

strOptions.fold.lineWidth = 0;

interface PackageGeneratorOptions extends GeneratorOptions {
    'http-path': string;
    packageName: string;
    packagePath: string;
}

class PackageGenerator<T extends PackageGeneratorOptions = PackageGeneratorOptions> extends BaseGenerator<T> {
    constructor(args: string | string[], opts: T) {
        super(args, opts);

        this.argument('packageName', { type: String, required: true });

        this.option('http-path', { type: String });
        this.option('path', { type: String });

        if (!/^[a-z0-9-]+$/.test(this.options.name)) {
            throw new Error('Package name can only contains lowercase numbers, numbers and dashes');
        }

        if (this.options.path) {
            const validated = validateProjectPath(this.options.path);
            if (validated === true) {
                this.options.packagePath = this.options.path;
            } else {
                throw new Error(validated);
            }
        } else {
            this.options.packagePath = this.options.packageName;
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
        const { packageName } = this.options;

        const extendedContext = {
            encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
            ...context,
        };

        for (const file of ['all.yaml', 'staging.yaml']) {
            await this.#appendTemplateIfExists(
                `${templatePath}/group_vars/${file}.ejs`,
                `ansible/group_vars/${file}`,
                extendedContext,
            );
        }

        for (const file of ['deployment.yaml', 'provision.yaml', 'nginx.conf.j2']) {
            this.renderTemplate(
                `${templatePath}/package/${file}.ejs`,
                `ansible/packages/${packageName}/${file}`,
                extendedContext,
            );
        }
    }

    async configureScripts(templatePath: string, context: TemplateData = {}): Promise<void> {
        for (const script of ['bootstrap', 'server', 'update']) {
            await this.#appendTemplateIfExists(`${templatePath}/${script}.ejs`, `script/${script}`, context);
        }
    }

    async #appendTemplateIfExists(from: string, to: string, context: TemplateData): Promise<void> {
        if (fs.existsSync(this.templatePath(from))) {
            await this.appendTemplate(from, to, context);
        }
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
            httpPath: this.options['http-path'],
            packageName: this.options.packageName,
            packagePath: this.options.packagePath,
            projectName: this.config.get('projectName'),
            ...context,
        };
    }
}

export type { PackageGeneratorOptions };
export default PackageGenerator;
