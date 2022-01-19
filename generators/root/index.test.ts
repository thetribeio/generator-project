import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import helpers from 'yeoman-test';

// Vault custom tag stub
const regexp = {
    identify: () => false,
    tag: '!vault',
    resolve: () => null,
};

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

    test('It add a basic auth to staging config', async () => {
        const content = await fs.promises.readFile(path.join(root, 'ansible', 'group_vars', 'staging.yaml'), 'utf8');
        const vars = YAML.parse(content, { customTags: [regexp] });

        expect(vars.basic_auth).toBeDefined();
    });
});
