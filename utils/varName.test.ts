import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import varName from './varName';

test('It replaces dashes with underscores', () => {
    assert.equal(varName('some-name'), 'some_name');
});

test('It replaces multiple dashes with underscores', () => {
    assert.equal(varName('some-other-name'), 'some_other_name');
});
