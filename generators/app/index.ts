import Generator from 'yeoman-generator';

enum BackendChoice {
    Express = 'express',
    Symfony = 'symfony',
}

enum FrontendChoice {
    CreateReactApp = 'create-react-app',
    NextJS = 'next-js',
    Twig = 'twig',
}

interface Prompt {
    backend: BackendChoice;
    frontend: FrontendChoice;
}

const prompt = [
    {
        type: 'list',
        name: 'backend',
        message: 'What backend do you want to use?',
        choices: [
            {
                name: 'Express',
                value: BackendChoice.Express,
            },
            {
                name: 'Symfony',
                value: BackendChoice.Symfony,
            },
        ],
    },
    {
        type: 'list',
        name: 'frontend',
        message: 'What frontend do you want to use?',
        choices: ({ backend }: Prompt) => [
            {
                name: 'Create React App',
                value: FrontendChoice.CreateReactApp,
            },
            {
                name: 'Next.js',
                value: FrontendChoice.NextJS,
            },
            backend === BackendChoice.Symfony ? {
                name: 'Twig',
                value: FrontendChoice.Twig,
            } : null,
        ].filter((choice) => choice !== null),
    },
];

class AppGenerator extends Generator {
    async prompting() {
        const { backend, frontend }: Prompt = await this.prompt<Prompt>(prompt);

        this.composeWith(require.resolve('../root'));

        switch (backend) {
            case BackendChoice.Express:
                this.composeWith(require.resolve('../express'), { arguments: ['backend'] });
                break;
            case BackendChoice.Symfony: {
                let args = ['backend'];

                if (frontend === FrontendChoice.Twig) {
                    args = [...args, '--twig'];
                }

                this.composeWith(require.resolve('../symfony'), { arguments: args });
                break;
            }
        }

        switch (frontend) {
            case FrontendChoice.CreateReactApp:
                this.composeWith(require.resolve('../create-react-app'), { arguments: ['frontend'] });
                break;
            case FrontendChoice.NextJS:
                this.composeWith(require.resolve('../next-js'), { arguments: ['frontend'] });
                break;
            case FrontendChoice.Twig:
                // Do nothing since the twig frontend is included in the Symfony generator
                break;
        }
    }
}

export default AppGenerator;
