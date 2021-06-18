import fs from 'fs';
import path from 'path';
import execa from 'execa';
import YAML from 'yaml';
import helpers from 'yeoman-test';

describe('When running the generator', () => {
    let root: string;
    const packageName = 'test';

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments([packageName]);

        await execa(path.resolve(root, 'script', 'bootstrap'));
    });

    afterAll(async () => {
        await execa('docker-compose', ['down', '--rmi', 'local', '--volumes'], { cwd: root });
        await fs.promises.rm(root, { recursive: true });
    });

    const run = async (container: string, command: string, args: string[]): Promise<void> => {
        await execa('docker-compose', ['run', '--rm', '--no-deps', container, command, ...args], { cwd: root });
    };

    test('It generates a project which correctly builds', async () => {
        await run('test', 'yarn', ['build']);
    });

    test('It generates a project which correctly lints', async () => {
        await run('test', 'yarn', ['lint']);
    });

    test('It generates a docker-compose.yaml with the right fields', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'docker-compose.yaml'), 'utf8'));
        expect(all.version).toBeDefined();
        expect(all.services[packageName]).toBeDefined();
    });

    test('It extends the ansible configuration', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'ansible/group_vars/all.yaml'), 'utf8'));

        expect(all.test_env).toBeDefined();
    });
});

describe('When running the generator with the path option', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test', '--path', 'packages/test']);
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates the project in the given directory', async () => {
        expect(fs.existsSync(path.join(root, 'packages/test'))).toBe(true);
    });
});
