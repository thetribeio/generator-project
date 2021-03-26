import fs from 'fs';
import path from 'path';
import helpers from 'yeoman-test';

describe('When running the generator', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates an ansible configuration', async () => {
        await fs.promises.access(path.join(root, 'ansible', 'provision.yaml'), fs.constants.R_OK);
        await fs.promises.access(path.join(root, 'ansible', 'deployment.yaml'), fs.constants.R_OK);
    });

    test('It generates an ansible vault pass', async () => {
        await fs.promises.access(path.join(root, 'ansible', 'vault_pass.txt'), fs.constants.R_OK);
    });
});
