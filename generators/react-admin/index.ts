import PackageGenerator from '../../utils/PackageGenerator';

class ReactAdminSubGenerator extends PackageGenerator {
    writing(): void {
        const { packagePath } = this.options;

        this.renderTemplate('base', packagePath, undefined, undefined, { globOptions: { dot: true } });

        this.fs.delete(`${packagePath}/src/App.css`);
        this.fs.delete(`${packagePath}/src/App.test.tsx`);
        this.fs.delete(`${packagePath}/src/logo.svg`);
        this.fs.delete(`${packagePath}/src/index.css`);
        this.#replace(`${packagePath}/src/index.tsx`, /\nimport '\.\/index\.css';\n/, '\n');
    }

    #replace(filepath: string, searchValue: string|RegExp, replaceValue: string): void {
        this.fs.write(filepath, this.fs.read(filepath).replace(searchValue, replaceValue));
    }
}

class ReactAdminGenerator extends PackageGenerator {
    initializing(): void {
        const { 'http-path': httpPath, packageName, packagePath } = this.options;
        const args = [packageName, `--path=${packagePath}`, `--http-path=${httpPath}`];

        this.composeWith(require.resolve('../create-react-app'), args);
        this.composeWith({ Generator: ReactAdminSubGenerator, path: __dirname }, args);
    }
}

export default ReactAdminGenerator;
