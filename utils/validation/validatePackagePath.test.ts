import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import validatePackagePath from './validatePackagePath';

test('Path with null byte is not valid', () => {
    assert.equal(validatePackagePath('som\0e/path'), 'Path can\'t contain null bytes');
});

test('Absolute path is not valid', () => {
    assert.equal(validatePackagePath('/absolute/path'), 'Path can\'t be absolute');
});

test('Curent user home path is not valid', () => {
    assert.equal(validatePackagePath('~/test'), 'Path can\'t start with ~');
});

test('Other user home path is not valid', () => {
    assert.equal(validatePackagePath('~user/test'), 'Path can\'t start with ~');
});

test('Path with ".." segment is not valid', () => {
    assert.equal(validatePackagePath('../test'), 'Path can\'t contain parent directory segment');
});

test('Path with "." segment is not valid', () => {
    assert.equal(validatePackagePath('./test'), 'Path can\'t contain current directory segment');
});

test('Path with ".." in a segment is valid', () => {
    assert.equal(validatePackagePath('..test/test'), true);
});

test('Path with "." in a segment is valid', () => {
    assert.equal(validatePackagePath('.test/test'), true);
});
