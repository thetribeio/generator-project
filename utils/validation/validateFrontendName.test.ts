import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import validateFrontendName from './validateFrontendName';

test('Frontend can not be named "backend"', () => {
    assert.equal(validateFrontendName([])('backend'), 'A frontend can not be named backend');
});

test('Frontend can not be named the same as an already existing frontend', () => {
    assert.equal(validateFrontendName(['frontend'])('frontend'), 'There is already one frontend called "frontend"');
});

test('Frontend name with a space is not valid', () => {
    assert.equal(
        validateFrontendName([])('test project'),
        'Frontend name can only contains lowercase alphanumerical characters and dashes',
    );
});

test('Frontend name with uppercase characters is not valid', () => {
    assert.equal(
        validateFrontendName([])('TEST'),
        'Frontend name can only contains lowercase alphanumerical characters and dashes',
    );
});

test('Frontend name starting with a number is not valid', () => {
    assert.equal(validateFrontendName([])('123test'), 'Frontend name must start with an alphabetical character');
});

test('Valid frontend name', () => {
    assert.equal(validateFrontendName([])('test-001-project'), true);
});
