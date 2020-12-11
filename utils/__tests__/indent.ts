import indent from '../indent';

test('It indents strings correctly', () => {
    expect(indent('foo\nbar', 4)).toEqual('    foo\n    bar');
});
