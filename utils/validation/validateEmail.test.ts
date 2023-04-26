import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import validateEmail from './validateEmail';

test('Valid email', () => {
    assert.equal(validateEmail('test@example.com'), true);
});

test('Empty string is not a valid email', () => {
    assert.equal(validateEmail(''), 'The value is not a valid email.');
});
