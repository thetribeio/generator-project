import fs from 'fs';
import { Data as TemplateData } from 'ejs';
import YAML, { Options } from 'yaml';
import { strOptions } from 'yaml/types';
import { GeneratorOptions } from 'yeoman-generator';
import BaseGenerator from './BaseGenerator';
import * as CircleCI from './circleci';
import * as Codemagic from './codemagic';
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

    getContext(context: TemplateData): TemplateData {
        return super.getContext({
            httpPath: this.options['http-path'],
            packageName: this.options.packageName,
            packagePath: this.options.packagePath,
            ...context,
        });
    }

    configureDockerCompose(templatePath: string, context: TemplateData = {}): void {
        this.#extendYAML(
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

    configureCodemagic(templatePath: string, context: TemplateData = {}): void {
        this.#extendYAML(
            templatePath,
            'codemagic.yaml',
            context,
            (oldConfig, config) => Codemagic.mergeConfig(
                Codemagic.Config.fromRaw(oldConfig),
                Codemagic.Config.fromRaw(config),
            ).toRaw(),
            { indent: 2 },
        );
    }

    configureCircleCI(templatePath: string, context: TemplateData = {}): void {
        this.#extendYAML(
            templatePath,
            '.circleci/config.yml',
            context,
            (oldConfig, config) => CircleCI.mergeConfig(
                CircleCI.Config.fromRaw(oldConfig),
                CircleCI.Config.fromRaw(config),
            ).toRaw(),
            { indent: 2 },
        );
    }

    configureAnsible(templatePath: string, context: TemplateData = {}): void {
        const { packageName } = this.options;

        for (const file of ['all.yaml', 'staging.yaml']) {
            if (this.templateExists(`${templatePath}/group_vars/${file}.ejs`)) {
                this.appendTemplate(`${templatePath}/group_vars/${file}.ejs`, `ansible/group_vars/${file}`, context);
            }
        }

        for (const file of ['deployment.yaml', 'provision.yaml', 'nginx.conf.j2']) {
            this.renderTemplate(
                `${templatePath}/package/${file}.ejs`,
                `ansible/packages/${packageName}/${file}`,
                context,
            );
        }
    }

    configureChart(templatePath: string, context: TemplateData = {}): void {
        const { packageName } = this.options;

        for (const file of fs.readdirSync(this.templatePath(templatePath))) {
            const fileName = file.replace(/\.ejs$/, '');

            const destinationName = fileName.startsWith('_')
                ? `_${packageName}-${fileName.substring(1)}`
                : `${packageName}-${fileName}`;

            this.renderTemplate(
                `${templatePath}/${file}`,
                `modules/deployment/chart/templates/${destinationName}`,
                context,
            );
        }
    }

    configureScripts(templatePath: string, context: TemplateData = {}): void {
        for (const script of ['bootstrap', 'server', 'update']) {
            if (this.templateExists(`${templatePath}/${script}.ejs`)) {
                this.appendTemplate(`${templatePath}/${script}.ejs`, `script/${script}`, context);
            }
        }
    }

    #extendYAML(
        template: string,
        destination: string,
        context: TemplateData,
        merger: (a: any, b: any) => any,
        options: Options = {},
    ): void {
        // If the destination doesn't exists, only render the template instead of merging.
        if (!this.existsDestination(destination)) {
            this.renderTemplate(template, destination, this.getContext(context));

            return;
        }

        const config = YAML.parse(this.renderTemplateToString(template, this.getContext(context)));

        const oldConfig = YAML.parse(this.readDestination(destination));

        const newConfig = merger(oldConfig, config);

        this.writeDestination(destination, YAML.stringify(newConfig, options));
    }
}

export type { PackageGeneratorOptions };
export default PackageGenerator;
