import Generator from 'yeoman-generator';

class NextJSGenerator extends Generator {
    writing() {
        const { name } = this.options;
        this.fs.copyTpl(this.templatePath('base'), this.destinationPath(name), {
            name,
        });
    }
}

export default NextJSGenerator;
