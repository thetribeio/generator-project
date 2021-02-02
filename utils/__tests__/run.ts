import run from '../run';

test('It returns a resolved promise on success', async () => {
    await run('true');
});

test('It returns a rejected promise on error', async () => {
    let error;

    try {
        await run('bash', ['-c', 'echo "FooError" >&2 && false']);
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toEqual('FooError');
});
