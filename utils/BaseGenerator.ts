import fs from 'fs';
import type { GeneratorOptions, PromptAnswers, PromptQuestion } from '@yeoman/types';
import ejs, { Data as TemplateData, Options as TemplateOptions } from 'ejs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CopyOptions } from 'mem-fs-editor';
import Generator from 'yeoman-generator';
import { rootDomain, subdomain } from './domain';
import indent from './indent';
import createFilesystemManipulator, { Filesystem } from './manipulator/filesystem';
import varName from './varName';

const processDestinationPath = (path: string): string => path
    .replace(/\.ejs$/, '')
    .replace(/\/gitignore$/, '/.gitignore');

class BaseGenerator<T extends GeneratorOptions = GeneratorOptions> extends Generator<T> {
    /**
     * Prompt questions and store the result in the config.
     *
     * It differs from the `store` parameter of the `prompt` method on the following points:
     *  - It only store the data in the local config and not the global config
     *  - It doesn't nest the value under a `promptValues` key in the config
     */
    async promptConfig<A extends PromptAnswers>(questions: PromptQuestion<A>[]): Promise<A> {
        const loaded = questions.map((question) => ({
            ...question,
            default: this.config.get(question.name!) ?? question.default,
        }));

        const anwsers = await this.prompt<A>(loaded as any);

        for (const [name, value] of Object.entries(anwsers)) {
            this.config.set(name, value);
        }

        return anwsers;
    }

    getContext(context: TemplateData): TemplateData {
        return {
            // Utility functions
            indent,
            rootDomain,
            subdomain,
            varName,

            // Common variables
            deployment: this.config.get('deployment'),
            projectName: this.config.get('projectName'),

            ...context,
        };
    }

    destinationExists(path: string): boolean {
        return this.fs.exists(this.destinationPath(path));
    }

    templateExists(path: string): boolean {
        return fs.existsSync(this.templatePath(path));
    }

    renderTemplate<D extends TemplateData = TemplateData>(
        source?: string | string[],
        destination?: string | string[],
        templateData?: string | D,
        templateOptions?: TemplateOptions,
        copyOptions?: CopyOptions,
    ): void {
        if (templateData === undefined || typeof templateData === 'string') {
            // eslint-disable-next-line no-param-reassign,no-underscore-dangle
            templateData = this._templateData<D>(templateData);
        }

        super.renderTemplate(source, destination, this.getContext(templateData), templateOptions, {
            globOptions: { dot: true },
            processDestinationPath,
            ...copyOptions,
        });
    }

    renderTemplateToString(source: string, context: TemplateData = {}): string {
        return ejs.render(this.fs.read(this.templatePath(source))!, this.getContext(context));
    }

    appendTemplate(source: string, destination: string, context: TemplateData = {}): void {
        this.appendDestination(destination, this.renderTemplateToString(source, context));
    }

    prependTemplate(source: string, destination: string, context: TemplateData = {}): void {
        const destinationPath = this.destinationPath(destination);

        this.fs.write(destinationPath, this.renderTemplateToString(source, context) + this.fs.read(destinationPath));
    }

    appendDestination(destination: string, content: string): void {
        this.fs.append(this.destinationPath(destination), content);
    }

    replaceDestination(path: string, searchValue: RegExp, replaceValue: string): void {
        this.writeDestination(path, (this.readDestination(path) as string).replace(searchValue, replaceValue));
    }

    /**
     * Add a terraform variable to the deployment module and its value to for the staging environment.
     */
    writeTerraformVariable(name: string, type: string, value: string): void {
        this.replaceDestination(
            'modules/deployment/variables.tf',
            /$/s,
            `\nvariable "${name}" {\n    type = ${type}\n}\n`,
        );

        this.replaceDestination(
            'environments/staging/main.tf',
            /module "deployment" {\n(.*?)\n}/s,
            `module "deployment" {\n$1\n    ${name} = ${value}\n}`,
        );
    }

    /**
     * Add a helm release variable to the terraform config.
     */
    writeReleaseVariable(name: string, value: string): void {
        this.replaceDestination(
            'modules/deployment/release.tf',
            /(resource "helm_release" "main" {\n.*?)(\n})/s,
            `$1\n\n    set {\n        name  = "${name}"\n        value = ${value}\n    }$2`,
        );
    }

    get destination(): Filesystem {
        return createFilesystemManipulator(this.fs, this.destinationPath.bind(this));
    }
}

export default BaseGenerator;
