import PackageGenerator from '../../utils/PackageGenerator';

class NextJSGenerator extends PackageGenerator {
    writing() {
        const { packageName } = this.options;
        this.fs.copyTpl(this.templatePath('base'), this.destinationPath(packageName), {
            packageName,
        });
    }

    install(): void {
        const { packageName } = this.options;

        this.yarnInstall(undefined, { frozenLockfile: true }, { cwd: this.destinationPath(packageName) });
    }
}

export default NextJSGenerator;
