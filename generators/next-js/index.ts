import Generator, { GeneratorOptions } from 'yeoman-generator';

class NextJSGenerator extends Generator {
    constructor(args: string | string[], opts: GeneratorOptions) {
        super(args, opts);

        this.argument('name', { type: String, required: true });
    }

    writing() {
        const { name } = this.options;
        this.fs.copyTpl(this.templatePath('base'), this.destinationPath(name), {
            name,
        });
    }
}

export default NextJSGenerator;
