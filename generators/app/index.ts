import type { PromptQuestion } from '@yeoman/types';
import BaseGenerator from '../../utils/BaseGenerator';
import validateFrontendName from '../../utils/validation/validateFrontendName';

enum BackendChoice {
    Express = 'express',
    Symfony = 'symfony',
    FastAPI = 'fast-api',
}

type BackendPrompt = {
    backend: BackendChoice|null;
};

const backendPrompt: PromptQuestion<BackendPrompt>[] = [
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

type Frontend = {
    type: FrontendType,
    name: string,
};

type FrontendPrompt = Frontend & {
    add: boolean;
};

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
        const { backend } = await this.promptConfig<BackendPrompt>(backendPrompt);
        const frontends = await this.#promptFrontends();

        await this.composeWith(require.resolve('../root'));

        if (backend) {
            // We suppose that the backend will sit at the root if there is no frontend.
            const httpPath = frontends.length ? '/api/' : '/';
            const args = ['backend', `--http-path=${httpPath}`];

            switch (backend) {
                case BackendChoice.Express:
                    await this.composeWith(require.resolve('../express'), args);
                    break;
                case BackendChoice.FastAPI:
                    await this.composeWith(require.resolve('../fast-api'), args);
                    break;
                case BackendChoice.Symfony: {
                    await this.composeWith(require.resolve('../symfony'), args);
                    break;
                }
            }
        }

        for (const { type, name } of frontends) {
            switch (type) {
                case FrontendType.React:
                    await this.composeWith(require.resolve('../react'), [name, '--http-path=/']);
                    break;
                case FrontendType.NextJS:
                    await this.composeWith(require.resolve('../next-js'), [name, '--http-path=/']);
                    break;
                case FrontendType.ReactAdmin:
                    await this.composeWith(require.resolve('../react-admin'), [name, '--http-path=/admin/']);
                    break;
                case FrontendType.Flutter:
                    await this.composeWith(require.resolve('../flutter-mobile'), [name]);
                    break;
                case FrontendType.ReactNative:
                    await this.composeWith(require.resolve('../react-native-mobile'), [name]);
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

        const loadedFrontends = this.config.get<Frontend[]>('frontends') || [undefined];

        for (;;) {
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
