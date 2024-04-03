import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import Config from './Config';

test('fromRaw parse the workflows', () => {
    const config = Config.fromRaw({
        workflows: {
            my_workflow: {},
        },
    });

    assert.ok(config.workflows.my_workflow);
});
