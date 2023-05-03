import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import validateApplicationPrefix from './validateApplicationPrefix';

describe('Application Prefix Validator', () => {
    test('Application prefix with a space is not valid', () => {
        assert.equal(
            validateApplicationPrefix('test project'),
            'Application prefix can only contains lowercase letters, numbers and dots',
        );
    });

    test('Application prefix with uppercase characters is not valid', () => {
        assert.equal(
            validateApplicationPrefix('TEST'),
            'Application prefix can only contains lowercase letters, numbers and dots',
        );
    });

    test('Application prefix with a dash is not valid', () => {
        assert.equal(
            validateApplicationPrefix('test-'),
            'Application prefix can only contains lowercase letters, numbers and dots',
        );
    });

    test('Application prefix with an underscore is not valid', () => {
        assert.equal(
            validateApplicationPrefix('test_'),
            'Application prefix can only contains lowercase letters, numbers and dots',
        );
    });

    test('Application prefix ending with a dot is not valid', () => {
        assert.equal(validateApplicationPrefix('test.'), 'Application prefix cannot end with a dot');
    });

    test('Valid application prefix', () => {
        assert.equal(validateApplicationPrefix('com.example.test'), true);
    });
});
