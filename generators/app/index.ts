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

        this.composeWith(require.resolve('../root'));

        this.composeWith(require.resolve('../express'), { arguments: ['backend'] });

        switch (frontend) {
            case FrontendChoice.CreateReactApp:
                this.composeWith(require.resolve('../create-react-app'), { arguments: ['frontend'] });
                break;
            case FrontendChoice.NextJS:
                this.composeWith(require.resolve('../next-js'), { arguments: ['frontend'] });
                break;
            default:
                throw new Error('Invalid frontend');
        }
    }
}

export default AppGenerator;
