import BaseGenerator from '../../utils/BaseGenerator';

class NodeGenerator extends BaseGenerator {
    writing() {
        const { name } = this.options;

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(name),
            { name },
        );

        this.configureContainer(name, {
            build: name,
            volumes: [
                '.:/usr/src/project',
            ],
        });

        this.configureCircleCI(this.templatePath('circleci.yaml.ejs'), { name });
    }
}

export default NodeGenerator;
