import Config from './Config';
import mergeConfig from './mergeConfig';

test('It keeps workflow from first config if second is not present', () => {
    const firstConfig = new Config({
        workflows: {
            firstWorkflow: {},
        },
    });

    const secondConfig = new Config({
        workflows: {},
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    expect(mergedConfig.workflows).toEqual(firstConfig.workflows);
});

test('It keeps workflow from second config if first is not present', () => {
    const firstConfig = new Config({
        workflows: {},
    });

    const secondConfig = new Config({
        workflows: {
            secondWorkflow: {},
        },
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    expect(mergedConfig.workflows).toEqual(secondConfig.workflows);
});

test('It merges jobs of the same workflow from different configs', () => {
    const firstConfig = new Config({
        workflows: {
            firstWorkflow: {},
        },
    });

    const secondConfig = new Config({
        workflows: {
            secondWorkflow: {},
        },
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    expect(mergedConfig.workflows.firstWorkflow).toBeDefined();
    expect(mergedConfig.workflows.secondWorkflow).toBeDefined();
});
