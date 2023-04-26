import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import indent from './indent';

test('It indents strings correctly', () => {
    assert.equal(indent('foo\nbar', 4), '    foo\n    bar');
});
