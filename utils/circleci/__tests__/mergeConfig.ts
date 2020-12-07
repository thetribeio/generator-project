import Config from '../Config';
import mergeConfig from '../mergeConfig';
import Workflow from '../Workflow';

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
