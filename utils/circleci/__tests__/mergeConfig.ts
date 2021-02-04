import Config from '../Config';
import mergeConfig from '../mergeConfig';
import Workflow from '../Workflow';

test('It keeps workflow from first config if second is not present', () => {
    const firstConfig = new Config({
        version: '2',
        jobs: {},
        workflowsVersion: '2',
        workflows: {
            build: new Workflow({
                jobs: {
                    firstJob: {},
                },
            }),
        },
    });

    const secondConfig = new Config({
        version: '2',
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    expect(mergedConfig.workflows.build).toEqual(firstConfig.workflows.build);
});

test('It keeps workflow from second config if first is not present', () => {
    const firstConfig = new Config({
        version: '2',
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const secondConfig = new Config({
        version: '2',
        jobs: {},
        workflowsVersion: '2',
        workflows: {
            build: new Workflow({
                jobs: {
                    secondJob: {},
                },
            }),
        },
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    expect(mergedConfig.workflows.build).toEqual(secondConfig.workflows.build);
});

test('It merges jobs of the same workflow from different configs', () => {
    const firstConfig = new Config({
        version: '2',
        jobs: {},
        workflowsVersion: '2',
        workflows: {
            build: new Workflow({
                jobs: {
                    firstJob: {},
                },
            }),
        },
    });

    const secondConfig = new Config({
        version: '2',
        jobs: {},
        workflowsVersion: '2',
        workflows: {
            build: new Workflow({
                jobs: {
                    secondJob: {},
                },
            }),
        },
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    expect(mergedConfig.workflows.build.jobs.firstJob).toBeDefined();
    expect(mergedConfig.workflows.build.jobs.secondJob).toBeDefined();
});
