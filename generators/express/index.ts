import { GeneratorOptions } from 'yeoman-generator';
import BaseGenerator from '../../utils/BaseGenerator';

class ExpressGenerator extends BaseGenerator {
    constructor(args: string | string[], opts: GeneratorOptions) {
        super(args, opts);

        this.argument('name', { type: String, required: true });
    }

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

    install(): void {
        const { name } = this.options;

        this.yarnInstall(undefined, { frozenLockfile: true }, { cwd: this.destinationPath(name) });
    }
}

export default ExpressGenerator;
