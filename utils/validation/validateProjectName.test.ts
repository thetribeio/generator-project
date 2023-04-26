import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import validateProjectName from './validateProjectName';

test('Project name with a space is not valid', () => {
    assert.equal(
        validateProjectName('test project'),
        'Project name can only contains lowercase alphanumerical characters and dashes',
    );
});

test('Project name with uppercase characters is not valid', () => {
    assert.equal(
        validateProjectName('TEST'),
        'Project name can only contains lowercase alphanumerical characters and dashes',
    );
});

test('Project name starting with a number is not valid', () => {
    assert.equal(validateProjectName('123test'), 'Project name must start with an alphabetical character');
});

test('Valid project name', () => {
    assert.equal(validateProjectName('test-001-project'), true);
});
