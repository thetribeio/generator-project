import fs from 'fs';
import path from 'path';
import execa from 'execa';
import YAML from 'yaml';
import helpers from 'yeoman-test';

describe('When running the generator', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withOptions({ twig: true })
            .withArguments(['test']);

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
        await run('test-node', 'yarn', ['build']);
    });

    test('It generates a project which correctly lints', async () => {
        await run('test-php', 'vendor/bin/php-cs-fixer', ['fix', '--dry-run', '--diff', '--using-cache', 'no']);
        await run('test-node', 'yarn', ['lint:js']);
        await run('test-node', 'yarn', ['lint:scss']);
    });

    test('It generates a docker-compose.yaml with a version fields', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'docker-compose.yaml'), 'utf8'));

        expect(all.version).toBeDefined();
    });

    test('It extends the ansible configuration', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'ansible/group_vars/all.yaml'), 'utf8'));

        expect(all.test_env).toBeDefined();
    });
});
