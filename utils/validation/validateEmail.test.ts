import validateEmail from './validateEmail';

test('Valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
});

test('Empty string is not a valid email', () => {
    expect(validateEmail('')).toBe('The value is not a valid email.');
});
