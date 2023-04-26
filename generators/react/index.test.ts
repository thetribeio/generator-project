import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import execa from 'execa';
import YAML from 'yaml';
import helpers from 'yeoman-test';
import { Config } from '../../utils/circleci';

describe('When running the generator', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test']);

        await execa(path.resolve(root, 'script', 'bootstrap'));
    });

    after(async () => {
        await execa('docker', ['compose', 'down', '--rmi', 'local', '--volumes'], { cwd: root });
        await fs.promises.rm(root, { recursive: true });
    });

    const run = async (container: string, command: string, args: string[]): Promise<void> => {
        await execa('docker', ['compose', 'run', '--rm', '--no-deps', container, command, ...args], { cwd: root });
    };

    test('It generates a project which correctly builds', async () => {
        await run('test', 'yarn', ['build']);
    });

    test('It generates a project which correctly lints', async () => {
        await run('test', 'yarn', ['lint']);
    });

    test('It generates a project with passing tests', async () => {
        await run('test', 'yarn', ['test', '--run']);
    });

    test('It generates a docker-compose.yaml without a version fields', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'docker-compose.yaml'), 'utf8'));

        assert(!('version' in all));
    });

    test('It extends the ansible configuration', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'ansible/group_vars/all.yaml'), 'utf8'));

        assert.ok(all.test_data);
    });
});

describe('When running the generator with kubernetes deployment', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ deployment: 'kubernetes' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test']);
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a valid CircleCI config', async () => {
        const content = await fs.promises.readFile(path.join(root, '.circleci', 'config.yml'), 'utf8');

        Config.fromRaw(YAML.parse(content));
    });

    test('It generates a project with a valid terraform config', async () => {
        const cwd = path.join(root, 'environments', 'staging');

        await execa('terraform', ['init', '--backend=false'], { cwd });
        await execa('terraform', ['validate'], { cwd });
    });

    test('It generates a valid helm chart', async () => {
        const cwd = path.join(root, 'modules', 'deployment', 'chart');

        await execa('helm', ['lint'], { cwd });
    });

    test('It generates a Dockerfile that correctly builds', async () => {
        await execa('docker', ['build', 'test'], { cwd: root });
        await execa('docker', ['build', '--target', 'sentry', 'test'], { cwd: root });
    });
});

describe('When running the generator with the path option', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test', '--path', 'packages/test']);
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates the project in the given directory', async () => {
        assert.ok(fs.existsSync(path.join(root, 'packages/test')));
    });
});
