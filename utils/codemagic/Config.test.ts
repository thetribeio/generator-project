import Config from './Config';

test('fromRaw parse the workflows', () => {
    const config = Config.fromRaw({
        workflows: {
            my_workflow: {},
        },
    });

    expect(config.workflows.my_workflow).toBeDefined();
});
