import { Question } from 'yeoman-generator';
import BaseGenerator from '../../utils/BaseGenerator';

enum BackendChoice {
    None = 'none',
    Express = 'express',
    Symfony = 'symfony',
    FastAPI = 'fast-api',
}

enum FrontendChoice {
    None = 'none',
    CreateReactApp = 'create-react-app',
    NextJS = 'next-js',
    Twig = 'twig',
    Flutter = 'flutter',
}

interface Prompt {
    admin: boolean;
    backend: BackendChoice;
    frontend: FrontendChoice;
    loopfront: boolean;
}

const prompt: Question<Prompt>[] = [
    {
        type: 'list',
        name: 'backend',
        message: 'What backend do you want to use?',
        choices: [
            {
                name: 'None',
                value: BackendChoice.None,
            },
            {
                name: 'Express',
                value: BackendChoice.Express,
            },
            {
                name: 'Symfony',
                value: BackendChoice.Symfony,
            },
            {
                name: 'FastAPI',
                value: BackendChoice.FastAPI,
            },
        ],
    },
    {
        type: 'list',
        name: 'frontend',
        message: 'What frontend do you want to use?',
        choices: ({ backend }: Prompt) => [
            {
                name: 'None',
                value: FrontendChoice.None,
            },
            {
                name: 'Create React App',
                value: FrontendChoice.CreateReactApp,
            },
            {
                name: 'Next.js',
                value: FrontendChoice.NextJS,
            },
            {
                name: 'Twig',
                value: FrontendChoice.Twig,
            },
            {
                name: 'Flutter',
                value: FrontendChoice.Flutter,
            },
        ].filter(({ value }) => value !== FrontendChoice.Twig || backend === BackendChoice.Symfony),
    },
    {
        type: 'confirm',
        name: 'admin',
        message: 'Do you want to generate an admin interface?',
        default: false,
    },
    {
        type: 'confirm',
        name: 'loopfront',
        message: 'Would you like to add another frontend?',
        default: false,
    },
];

class AppGenerator extends BaseGenerator {
    async prompting() {
        const { admin, backend, frontend, loopfront }: Prompt = await this.promptConfig<Prompt>(prompt);
        const fronts = [frontend];
        let shouldLoop = loopfront;

        while (shouldLoop) {
            const loopPrompt: Prompt = await this.promptConfig<Prompt>([prompt[1], prompt[3]]);
            shouldLoop = loopPrompt.loopfront;
            fronts.push(loopPrompt.frontend);
        }

        this.composeWith(require.resolve('../root'));

        switch (backend) {
            case BackendChoice.Express:
                this.composeWith(require.resolve('../express'), { arguments: ['backend', '--http-path=/api/'] });
                break;
            case BackendChoice.FastAPI:
                this.composeWith(require.resolve('../fast-api'), { arguments: ['backend', '--http-path=/api/'] });
                break;
            case BackendChoice.Symfony: {
                const args = fronts.includes(FrontendChoice.Twig)
                    ? ['backend', '--http-path=/', '--twig']
                    : ['backend', '--http-path=/api/'];

                this.composeWith(require.resolve('../symfony'), { arguments: args });
                break;
            }
            case BackendChoice.None:
                break;
        }

        fronts.forEach((frontendChoice: FrontendChoice, index: number) => {
            switch (frontendChoice) {
                case FrontendChoice.CreateReactApp:
                    this.composeWith(
                        require.resolve('../create-react-app'),
                        { arguments: [`frontend-react-${index}`, '--http-path=/'] },
                    );
                    break;
                case FrontendChoice.NextJS:
                    this.composeWith(
                        require.resolve('../next-js'),
                        { arguments: [`frontend-nextjs-${index}`, '--http-path=/'] },
                    );
                    break;
                case FrontendChoice.Twig:
                    // Do nothing since the twig frontend is included in the Symfony generator
                    break;
                case FrontendChoice.Flutter:
                    this.composeWith(require.resolve('../flutter-mobile'), [`mobile-flutter-${index}`]);
                    break;
                case FrontendChoice.None:
                    break;
            }
        });

        if (admin) {
            this.composeWith(require.resolve('../react-admin'), ['admin', '--http-path=/admin/']);
        }
    }

    end(): void {
        this.log('Your project was successfully generated, you can now start it with the ./script/server command.');
    }
}

export default AppGenerator;
