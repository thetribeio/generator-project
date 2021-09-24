import { Data as TemplateData, Options as TemplateOptions } from 'ejs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CopyOptions } from 'mem-fs-editor';
import Generator, { GeneratorOptions } from 'yeoman-generator';

const processDestinationPath = (path: string): string => path
    .replace(/\.ejs$/, '')
    .replace(/\/gitignore$/, '/.gitignore');

class BaseGenerator<T extends GeneratorOptions = GeneratorOptions> extends Generator<T> {
    renderTemplate(
        source: string | string[],
        destination?: string | string[],
        context?: TemplateData | string,
        templateOptions?: TemplateOptions | string,
        copyOptions?: CopyOptions,
    ): void {
        super.renderTemplate(source, destination, context, templateOptions, {
            globOptions: { dot: true },
            processDestinationPath,
            ...copyOptions,
        });
    }
}

export default BaseGenerator;
