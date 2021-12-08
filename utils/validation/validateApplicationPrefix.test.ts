import validateApplicationPrefix from './validateApplicationPrefix';

describe('Application Prefix Validator', () => {
    test('Application prefix with a space is not valid', () => {
        expect(validateApplicationPrefix('test project'))
            .toBe('Application prefix can only contains lowercase letters, numbers and dots');
    });

    test('Application prefix with uppercase characters is not valid', () => {
        expect(validateApplicationPrefix('TEST'))
            .toBe('Application prefix can only contains lowercase letters, numbers and dots');
    });

    test('Application prefix with a dash is not valid', () => {
        expect(validateApplicationPrefix('test-'))
            .toBe('Application prefix can only contains lowercase letters, numbers and dots');
    });

    test('Application prefix with an underscore is not valid', () => {
        expect(validateApplicationPrefix('test_'))
            .toBe('Application prefix can only contains lowercase letters, numbers and dots');
    });

    test('Application prefix ending with a dot is not valid', () => {
        expect(validateApplicationPrefix('test.'))
            .toBe('Application prefix cannot end with a dot');
    });

    test('Valid application prefix', () => {
        expect(validateApplicationPrefix('com.example.test')).toBe(true);
    });
});
