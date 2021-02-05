import PackageGenerator from '../../utils/PackageGenerator';

class CreateReactAppGenerator extends PackageGenerator {
    writing(): void {
        const { packageName } = this.options;

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(packageName),
            { packageName },
            undefined,
            { globOptions: { dot: true } },
        );
    }

    install(): void {
        const { packageName } = this.options;

        this.yarnInstall(undefined, { frozenLockfile: true }, { cwd: this.destinationPath(packageName) });
    }
}

export default CreateReactAppGenerator;
