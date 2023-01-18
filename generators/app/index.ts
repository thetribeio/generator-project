import { Question } from 'yeoman-generator';
import createResolve from '../../utils/createResolve';
import BaseGenerator from '../../utils/BaseGenerator';
import validateFrontendName from '../../utils/validation/validateFrontendName';

const resolve = createResolve(import.meta);

enum BackendChoice {
    Express = 'express',
    Symfony = 'symfony',
    FastAPI = 'fast-api',
}

interface BackendPrompt {
    backend: BackendChoice|null;
}

const backendPrompt: Question<BackendPrompt>[] = [
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
            {
                name: 'FastAPI',
                value: BackendChoice.FastAPI,
            },
            {
                name: 'None',
                value: null,
            },
        ],
    },
];

enum FrontendType {
    React = 'react',
    NextJS = 'next-js',
    ReactAdmin = 'react-admin',
    Flutter = 'flutter',
    ReactNative = 'react-native',
}

interface Frontend {
    type: FrontendType,
    name: string,
}

interface FrontendPrompt extends Frontend {
    add: boolean;
}

const defaultFrontendName = (type: FrontendType): string => {
    switch (type) {
        case FrontendType.React:
        case FrontendType.NextJS:
            return 'frontend';
        case FrontendType.ReactAdmin:
            return 'admin';
        case FrontendType.Flutter:
        case FrontendType.ReactNative:
            return 'mobile';
    }
};

class AppGenerator extends BaseGenerator {
    async prompting(): Promise<void> {
        const { backend }: BackendPrompt = await this.promptConfig<BackendPrompt>(backendPrompt);
        const frontends = await this.#promptFrontends();

        this.composeWith(resolve('../root'));

        if (backend) {
            // We suppose that the backend will sit at the root if there is no frontend.
            const httpPath = frontends.length ? '/api/' : '/';
            const options = { arguments: ['backend', `--http-path=${httpPath}`] };

            switch (backend) {
                case BackendChoice.Express:
                    this.composeWith(resolve('../express'), options);
                    break;
                case BackendChoice.FastAPI:
                    this.composeWith(resolve('../fast-api'), options);
                    break;
                case BackendChoice.Symfony: {
                    this.composeWith(resolve('../symfony'), options);
                    break;
                }
            }
        }

        for (const { type, name } of frontends) {
            switch (type) {
                case FrontendType.React:
                    this.composeWith(resolve('../react'), { arguments: [name, '--http-path=/'] });
                    break;
                case FrontendType.NextJS:
                    this.composeWith(resolve('../next-js'), { arguments: [name, '--http-path=/'] });
                    break;
                case FrontendType.ReactAdmin:
                    this.composeWith(resolve('../react-admin'), [name, '--http-path=/admin/']);
                    break;
                case FrontendType.Flutter:
                    this.composeWith(resolve('../flutter-mobile'), [name]);
                    break;
                case FrontendType.ReactNative:
                    this.composeWith(resolve('../react-native-mobile'), [name]);
                    break;
            }
        }
    }

    end(): void {
        this.log('Your project was successfully generated, you can now start it with the ./script/server command.');
    }

    /**
     * Custom prompting logic that allow choosing multiple frontends.
     *
     * This will save and reload the chosen frontends from the config in the same way `promptConfig` does.
     */
    async #promptFrontends(): Promise<Frontend[]> {
        let frontends: Frontend[] = [];

        const loadedFrontends = this.config.get('frontends') || [undefined];

        while (true) {
            const index = frontends.length;

            const frontend = await this.prompt<FrontendPrompt>([
                {
                    type: 'confirm',
                    name: 'add',
                    message: index === 0
                        ? 'Would you like to add a frontend?'
                        : 'Would you like to add another frontend?',
                    default: loadedFrontends.length > index,
                },
                {
                    type: 'list',
                    name: 'type',
                    message: 'What frontend do you want to use?',
                    choices: [
                        {
                            name: 'React',
                            value: FrontendType.React,
                        },
                        {
                            name: 'Next.js',
                            value: FrontendType.NextJS,
                        },
                        {
                            name: 'React Admin',
                            value: FrontendType.ReactAdmin,
                        },
                        {
                            name: 'Flutter',
                            value: FrontendType.Flutter,
                        },
                        {
                            name: 'React-native',
                            value: FrontendType.ReactNative,
                        },
                    ],
                    default: loadedFrontends[index]?.type,
                    when: ({ add }: FrontendPrompt) => add,
                },
                {
                    type: 'input',
                    name: 'name',
                    message: 'What name do you want to use for this frontend?',
                    default: ({ type }: FrontendPrompt) => loadedFrontends[index]?.name || defaultFrontendName(type),
                    validate: validateFrontendName(frontends.map(({ name }) => name)),
                    when: ({ add }: FrontendPrompt) => add,
                },
            ]);

            if (!frontend.add) {
                break;
            }

            frontends = [...frontends, { type: frontend.type, name: frontend.name }];
        }

        this.config.set('frontends', frontends);

        return frontends;
    }
}

export default AppGenerator;
