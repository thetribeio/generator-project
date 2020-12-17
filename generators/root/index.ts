import Generator from 'yeoman-generator';
import run from '../../utils/run';

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

    async install() {
        await run('git', ['init'], {
            cwd: this.destinationPath(),
        });
        await run('git', ['submodule', 'add', 'git@github.com:thetribeio/ansible-roles.git', 'roles-lib'], {
            cwd: this.destinationPath('ansible'),
        });
    }
}

export default RootGenerator;
