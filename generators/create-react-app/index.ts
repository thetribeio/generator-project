import Generator, { GeneratorOptions } from 'yeoman-generator';

class CreateReactAppGenerator extends Generator {
    constructor(args: string | string[], opts: GeneratorOptions) {
        super(args, opts);

        this.argument('name', { type: String, required: true });
    }

    writing(): void {
        const { name } = this.options;

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(name),
            { name },
            undefined,
            { globOptions: { dot: true } },
        );
    }

    install(): void {
        const { name } = this.options;

        this.yarnInstall(undefined, { frozenLockfile: true }, { cwd: this.destinationPath(name) });
    }
}

export default CreateReactAppGenerator;
