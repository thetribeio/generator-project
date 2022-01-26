import varify from './varify';

test('It replaces dashes with underscores', () => {
    expect(varify('some-name')).toBe('some_name');
});

test('It replaces multiple dashes with underscores', () => {
    expect(varify('some-other-name')).toBe('some_other_name');
});
