import Generator from 'yeoman-generator';

class RootGenerator extends Generator {
    writing() {
        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(),
            undefined,
            undefined,
            { globOptions: { dot: true } },
        );
    }
}

export default RootGenerator;
