import fs from 'fs';
import ejs, { Data as TemplateData, Options as TemplateOptions } from 'ejs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CopyOptions } from 'mem-fs-editor';
import Generator, { GeneratorOptions } from 'yeoman-generator';
import indent from './indent';

const processDestinationPath = (path: string): string => path
    .replace(/\.ejs$/, '')
    .replace(/\/gitignore$/, '/.gitignore');

class BaseGenerator<T extends GeneratorOptions = GeneratorOptions> extends Generator<T> {
    getContext(context: TemplateData): TemplateData {
        return {
            indent,
            ...context,
        };
    }

    destinationExists(path: string): boolean {
        return this.fs.exists(this.destinationPath(path));
    }

    templateExists(path: string): boolean {
        return fs.existsSync(this.templatePath(path));
    }

    renderTemplate(
        source: string,
        destination: string,
        context: TemplateData = {},
        templateOptions: TemplateOptions = {},
        copyOptions: CopyOptions = {},
    ): void {
        super.renderTemplate(source, destination, this.getContext(context), templateOptions, {
            globOptions: { dot: true },
            processDestinationPath,
            ...copyOptions,
        });
    }

    renderTemplateToString(source: string, context: TemplateData = {}): string {
        return ejs.render(this.fs.read(this.templatePath(source)), this.getContext(context));
    }

    appendTemplate(source: string, destination: string, context: TemplateData = {}): void {
        this.fs.append(this.destinationPath(destination), this.renderTemplateToString(source, context));
    }

    prependTemplate(source: string, destination: string, context: TemplateData = {}): void {
        const destinationPath = this.destinationPath(destination);

        this.fs.write(destinationPath, this.renderTemplateToString(source, context) + this.fs.read(destinationPath));
    }
}

export default BaseGenerator;
