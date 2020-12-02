import Generator from 'yeoman-generator';

enum FrontendChoice {
    CreateReactApp = 'create-react-app',
    NextJS = 'next-js',
}

interface Prompt {
    frontend: FrontendChoice,
}

class AppGenerator extends Generator {
    async prompting() {
        const { frontend }: Prompt = await this.prompt([
            {
                type: 'list',
                name: 'frontend',
                message: 'What frontend do you want to use?',
                choices: [
                    {
                        name: 'Create React App',
                        value: FrontendChoice.CreateReactApp,
                    },
                    {
                        name: 'Next.js',
                        value: FrontendChoice.NextJS,
                    },
                ],
            },
        ]);

        this.composeWith(require.resolve('../node'), { name: 'backend' });

        switch (frontend) {
            case FrontendChoice.CreateReactApp:
                this.composeWith(require.resolve('../create-react-app'), { name: 'frontend' });
                break;
            case FrontendChoice.NextJS:
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
