import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import execa from 'execa';
import YAML, { ScalarTag } from 'yaml';
import helpers from 'yeoman-test';

// Vault custom tag stub
const vault: ScalarTag = {
    default: false,
    identify: () => false,
    tag: '!vault',
    resolve: () => null,
};

describe('When running the generator', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;
    });

    after(async () => {
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
        const vars = YAML.parse(content, { customTags: [vault] });

        assert.ok('basic_auth' in vars);
    });
});

describe('When running the generator with kubernetes deployment', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({ contactEmail: 'test@example.com', deployment: 'kubernetes' });

        root = result.cwd;
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a valid terraform configuration', async () => {
        const cwd = path.join(root, 'environments', 'staging');

        await execa('terraform', ['init', '--backend=false'], { cwd });
        await execa('terraform', ['validate'], { cwd });
    });

    test('It generates a valid helm chart', async () => {
        const cwd = path.join(root, 'modules', 'deployment', 'chart');

        await execa('helm', ['lint'], { cwd });
    });
});
