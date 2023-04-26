import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import Config from './Config';
import mergeConfig from './mergeConfig';
import Workflow from './Workflow';

test('It keeps workflow from first config if second is not present', () => {
    const firstConfig = new Config({
        version: '2',
        executors: {},
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
        executors: {},
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    assert.deepEqual(mergedConfig.workflows.build, firstConfig.workflows.build);
});

test('It keeps workflow from second config if first is not present', () => {
    const firstConfig = new Config({
        version: '2',
        executors: {},
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const secondConfig = new Config({
        version: '2',
        executors: {},
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

    assert.deepEqual(mergedConfig.workflows.build, secondConfig.workflows.build);
});

test('It merges jobs of the same workflow from different configs', () => {
    const firstConfig = new Config({
        version: '2',
        executors: {},
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
        executors: {},
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

    assert.ok(mergedConfig.workflows.build?.jobs.firstJob);
    assert.ok(mergedConfig.workflows.build?.jobs.secondJob);
});

test('It merges executors from different configs', () => {
    const firstConfig = new Config({
        version: '2',
        executors: {
            first: {},
        },
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const secondConfig = new Config({
        version: '2',
        executors: {
            second: {},
        },
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    assert.ok(mergedConfig.executors.first);
    assert.ok(mergedConfig.executors.second);
});

test('It merges commands from different configs', () => {
    const firstConfig = new Config({
        version: '2',
        commands: {
            first: {},
        },
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const secondConfig = new Config({
        version: '2',
        commands: {
            second: {},
        },
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    assert.ok(mergedConfig.commands.first);
    assert.ok(mergedConfig.commands.second);
});

test('It merges orbs from different configs', () => {
    const firstConfig = new Config({
        version: '2',
        orbs: {
            first: 'first',
        },
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const secondConfig = new Config({
        version: '2',
        orbs: {
            second: 'second',
        },
        jobs: {},
        workflowsVersion: '2',
        workflows: {},
    });

    const mergedConfig = mergeConfig(firstConfig, secondConfig);

    assert.equal(mergedConfig.orbs.first, 'first');
    assert.equal(mergedConfig.orbs.second, 'second');
});
