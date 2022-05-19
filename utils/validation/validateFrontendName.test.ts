import validateFrontendName from './validateFrontendName';

test('Frontend can not be named "backend"', () => {
    expect(validateFrontendName([])('backend'))
        .toBe('A frontend can not be named backend');
});

test('Frontend can not be named the same as an already existing frontend', () => {
    expect(validateFrontendName(['frontend'])('frontend'))
        .toBe('There is already one frontend called "frontend"');
});

test('Frontend name with a space is not valid', () => {
    expect(validateFrontendName([])('test project'))
        .toBe('Frontend name can only contains lowercase alphanumerical characters and dashes');
});

test('Frontend name with uppercase characters is not valid', () => {
    expect(validateFrontendName([])('TEST'))
        .toBe('Frontend name can only contains lowercase alphanumerical characters and dashes');
});

test('Frontend name starting with a number is not valid', () => {
    expect(validateFrontendName([])('123test')).toBe('Frontend name must start with an alphabetical character');
});

test('Valid frontend name', () => {
    expect(validateFrontendName([])('test-001-project')).toBe(true);
});
