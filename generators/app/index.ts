import { Question } from 'yeoman-generator';
import BaseGenerator from '../../utils/BaseGenerator';

enum BackendChoice {
    Express = 'express',
    Symfony = 'symfony',
}

enum FrontendChoice {
    CreateReactApp = 'create-react-app',
    NextJS = 'next-js',
    Twig = 'twig',
}

enum MobileChoice {
    None = 'none',
    Flutter = 'flutter',
}

interface Prompt {
    admin: boolean;
    backend: BackendChoice;
    frontend: FrontendChoice;
    mobile: MobileChoice;
}

const prompt: Question<Prompt>[] = [
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
            {
                name: 'Twig',
                value: FrontendChoice.Twig,
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
        type: 'list',
        name: 'mobile',
        message: 'What mobile framework do you want to use ?',
        choices: [
            {
                name: 'No mobile app',
                value: MobileChoice.None,
            },
            {
                name: 'Flutter',
                value: MobileChoice.Flutter,
            },
        ],
        default: MobileChoice.None,
    },
];

class AppGenerator extends BaseGenerator {
    async prompting() {
        const { admin, backend, frontend, mobile }: Prompt = await this.promptConfig<Prompt>(prompt);

        this.composeWith(require.resolve('../root'));

        switch (backend) {
            case BackendChoice.Express:
                this.composeWith(require.resolve('../express'), { arguments: ['backend', '--http-path=/api/'] });
                break;
            case BackendChoice.Symfony: {
                const args = frontend === FrontendChoice.Twig
                    ? ['backend', '--http-path=/', '--twig']
                    : ['backend', '--http-path=/api/'];

                this.composeWith(require.resolve('../symfony'), { arguments: args });
                break;
            }
        }

        switch (frontend) {
            case FrontendChoice.CreateReactApp:
                this.composeWith(require.resolve('../create-react-app'), { arguments: ['frontend', '--http-path=/'] });
                break;
            case FrontendChoice.NextJS:
                this.composeWith(require.resolve('../next-js'), { arguments: ['frontend', '--http-path=/'] });
                break;
            case FrontendChoice.Twig:
                // Do nothing since the twig frontend is included in the Symfony generator
                break;
        }

        if (admin) {
            this.composeWith(require.resolve('../react-admin'), ['admin', '--http-path=/admin/']);
        }

        switch (mobile) {
            case MobileChoice.Flutter:
                this.composeWith(
                    require.resolve('../flutter-mobile'),
                    ['mobile'],
                );
                break;
            case MobileChoice.None:
                break;
        }
    }

    end(): void {
        this.log('Your project was successfully generated, you can now start it with the ./script/server command.');
    }
}

export default AppGenerator;
