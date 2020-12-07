import Config from '../Config';

test('It extract the workflow versions', () => {
    const config = Config.fromRaw({
        workflows: {
            version: '2',
        },
    });

    expect(config.workflowsVersion).toEqual('2');
    expect(config.workflows).toEqual({});
});

test('It errors on invalid workflow version', () => {
    expect(() => {
        Config.fromRaw({
            workflows: {
                version: '1',
            },
        });
    }).toThrow('Invalid workflows version: 1');
});
