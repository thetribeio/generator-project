import BaseGenerator from '../../utils/BaseGenerator';

class NodeGenerator extends BaseGenerator {
    async writing() {
        const { name } = this.options;

        this.fs.copyTpl(
            this.templatePath('base'),
            this.destinationPath(name),
            { name },
            undefined,
            { globOptions: { dot: true } },
        );

        await this.configureDockerCompose(this.templatePath('docker-compose.yaml.ejs'), { name });

        await this.configureCircleCI(this.templatePath('circleci.yaml.ejs'), { name });
    }
}

export default NodeGenerator;
