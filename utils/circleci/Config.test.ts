import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import Config from './Config';
import Workflow from './Workflow';

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

    assert.equal(config.workflowsVersion, '2');
    assert.deepEqual(config.workflows.build, new Workflow({
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

    assert.ok(config.executors.node);
});

test('fromRaw errors on invalid workflow version', () => {
    assert.throws(() => {
        Config.fromRaw({
            workflows: {
                version: '1',
            },
        });
    }, new Error('Invalid workflows version: 1'));
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

    assert.deepEqual(config.toRaw(), {
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
