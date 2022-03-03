import varName from './varName';

test('It replaces dashes with underscores', () => {
    expect(varName('some-name')).toBe('some_name');
});

test('It replaces multiple dashes with underscores', () => {
    expect(varName('some-other-name')).toBe('some_other_name');
});
