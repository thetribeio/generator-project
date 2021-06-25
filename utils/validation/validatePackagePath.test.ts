import validatePackagePath from './validatePackagePath';

test('Path with null byte is not valid', () => {
    expect(validatePackagePath('som\0e/path')).toBe('Path can\'t contain null bytes');
});

test('Absolute path is not valid', () => {
    expect(validatePackagePath('/absolute/path')).toBe('Path can\'t be absolute');
});

test('Curent user home path is not valid', () => {
    expect(validatePackagePath('~/test')).toBe('Path can\'t start with ~');
});

test('Other user home path is not valid', () => {
    expect(validatePackagePath('~user/test')).toBe('Path can\'t start with ~');
});

test('Path with ".." segment is not valid', () => {
    expect(validatePackagePath('../test')).toBe('Path can\'t contain parent directory segment');
});

test('Path with "." segment is not valid', () => {
    expect(validatePackagePath('./test')).toBe('Path can\'t contain current directory segment');
});

test('Path with ".." in a segment is valid', () => {
    expect(validatePackagePath('..test/test')).toBe(true);
});

test('Path with "." in a segment is valid', () => {
    expect(validatePackagePath('.test/test')).toBe(true);
});
