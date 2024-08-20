import createResolve from '../../utils/createResolve';
import PackageGenerator from '../../utils/PackageGenerator';

const resolve = createResolve(import.meta);

class ReactAdminSubGenerator extends PackageGenerator {
    writing(): void {
        const { packageName, packagePath } = this.options;

        this.renderTemplate('base', packagePath, undefined, undefined, { globOptions: { dot: true } });
        this.destination[`${packagePath}/package.json`].name = packageName;

        this.fs.delete(`${packagePath}/src/App.test.tsx`);
        this.fs.delete(`${packagePath}/src/components/`);
        this.fs.delete(`${packagePath}/src/logo.svg`);
    }
}

class ReactAdminGenerator extends PackageGenerator {
    initializing(): void {
        const { 'http-path': httpPath, packageName, packagePath } = this.options;
        const args = [packageName, `--path=${packagePath}`, `--http-path=${httpPath}`];

        this.composeWith(resolve('../react'), args);
        this.composeWith({ Generator: ReactAdminSubGenerator, path: resolve('.') }, args);
    }
}

export default ReactAdminGenerator;
