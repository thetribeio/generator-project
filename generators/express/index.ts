import BaseGenerator from '../../utils/BaseGenerator';

class NodeGenerator extends BaseGenerator {
    writing() {
        const nodeVersion = '14.15.1';
        const { name } = this.options;

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(name),
            { name, nodeVersion },
            undefined,
            { globOptions: { dot: true } },
        );

        this.configureDockerCompose(this.templatePath('docker-compose.yaml.ejs'), { name });

        this.configureCircleCI(this.templatePath('circleci.yaml.ejs'), { name, nodeVersion });
    }
}

export default NodeGenerator;
