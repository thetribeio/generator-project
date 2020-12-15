import fs from 'fs';
import path from 'path';
import helpers from 'yeoman-test';

describe('When running the generator with create-react-app', () => {
    let root: string;

    beforeAll(async () => {
        root = await helpers.run(path.resolve(__dirname, '..'))
            .withPrompts({ frontend: 'create-react-app' });
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates an express backend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'backend', 'package.json'), 'utf8'));

        expect(config.dependencies.express).toBeDefined();
    });
});
