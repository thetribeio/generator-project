import BaseGenerator from '../../utils/BaseGenerator';

class NodeGenerator extends BaseGenerator {
    writing() {
        const { name } = this.options;

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(name),
            { name },
        );

        this.configureDockerCompose(this.templatePath('docker-compose.yaml.ejs'), { name });

        this.configureCircleCI(this.templatePath('circleci.yaml.ejs'), { name });
    }
}

export default NodeGenerator;
