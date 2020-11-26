import Generator from 'yeoman-generator';

class AppGenerator extends Generator {
    async prompting() {
        const { frontend } = await this.prompt([
            {
                type: 'list',
                name: 'frontend',
                message: 'What frontend do you want to use?',
                choices: [
                    {
                        name: 'Create React App',
                        value: 'create-react-app',
                    },
                    {
                        name: 'Next.js',
                        value: 'next-js',
                    },
                ],
            },
        ]);

        this.composeWith(require.resolve('../node'), { name: 'backend' });

        switch (frontend) {
            case 'create-react-app':
                this.composeWith(require.resolve('../create-react-app'), { name: 'frontend' });
                break;
            case 'next-js':
                this.composeWith(require.resolve('../next-js'), { name: 'frontend' });
                break;
            default:
                throw new Error('Invalid frontend');
        }
    }

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

export default AppGenerator;
