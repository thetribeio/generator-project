import validateProjectName from './validateProjectName';

test('Project name with a space is not valid', () => {
    expect(validateProjectName('test project')).toBe('Project name can only contains lowercase alphanumerical characters and dashes');
});

test('Project name with uppercase characters is not valid', () => {
    expect(validateProjectName('TEST')).toBe('Project name can only contains lowercase alphanumerical characters and dashes');
});

test('Project name starting with a number is not valid', () => {
    expect(validateProjectName('123test')).toBe('Project name must start with an alphabetical character');
});

test('Valid project name', () => {
    expect(validateProjectName('test-project')).toBe(true);
});
