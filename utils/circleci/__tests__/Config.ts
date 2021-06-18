import Config from '../Config';
import Workflow from '../Workflow';

test('fromRaw parse the workflows', () => {
    const config = Config.fromRaw({
        workflows: {
            version: '2',
            build: {
                jobs: [
                    'install',
                    { lint: { requires: ['install'] } },
                ],
            },
        },
    });

    expect(config.workflowsVersion).toEqual('2');
    expect(config.workflows.build).toEqual(new Workflow({
        jobs: {
            install: {},
            lint: { requires: ['install'] },
        },
    }));
});

test('fromRaw parse the executors', () => {
    const config = Config.fromRaw({
        executors: {
            node: {},
        },
        workflows: {
            version: '2',
        },
    });

    expect(config.executors.node).toBeDefined();
});

test('fromRaw errors on invalid workflow version', () => {
    expect(() => {
        Config.fromRaw({
            workflows: {
                version: '1',
            },
        });
    }).toThrow('Invalid workflows version: 1');
});

test('toRaw returns the formated config', () => {
    const config = new Config({
        version: '2.1',
        jobs: {},
        workflowsVersion: '2',
        workflows: {
            build: new Workflow({
                jobs: {
                    install: {},
                    lint: { requires: ['install'] },
                },
            }),
        },
    });

    expect(config.toRaw()).toEqual({
        version: '2.1',
        jobs: {},
        workflows: {
            version: '2',
            build: {
                jobs: [
                    'install',
                    { lint: { requires: ['install'] } },
                ],
            },
        },
    });
});
