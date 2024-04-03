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
            .withPrompts({ twig: true })
            .withArguments(['test']);

        await execa(path.resolve(root, 'script', 'bootstrap'));
    });

    afterAll(async () => {
        await execa('docker', ['compose', 'down', '--rmi', 'local', '--volumes'], { cwd: root });
        await fs.promises.rm(root, { recursive: true });
    });

    const run = async (container: string, command: string, args: string[]): Promise<void> => {
        await execa('docker', ['compose', 'run', '--rm', '--no-deps', container, command, ...args], { cwd: root });
    };

    test('It generates a project which correctly builds', async () => {
        await run('test-node', 'yarn', ['build']);
    });

    test('It generates a project which correctly lints', async () => {
        await run('test-php', 'vendor/bin/php-cs-fixer', ['fix', '--dry-run', '--diff', '--using-cache', 'no']);
        await run('test-node', 'yarn', ['lint:js']);
        await run('test-node', 'yarn', ['lint:scss']);
    });

    test('It generates a project with a valid container', async () => {
        await run('test-php', 'bin/console', ['lint:container']);
    });

    test('It generates a docker-compose.yaml without a version fields', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'docker-compose.yaml'), 'utf8'));

        expect(all.version).toBeUndefined();
    });

    test('It extends the ansible configuration', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'ansible/group_vars/all.yaml'), 'utf8'));

        expect(all.test_env).toBeDefined();
    });

    test('The database is correctly added to production config', async () => {
        const content = await fs.promises.readFile(path.resolve(root, 'terraform/common/database/main.tf'), 'utf8');

        expect(content).toContain('resource "scaleway_rdb_database" "test" {');
    });

    test('It generates a project with a valid terraform config', async () => {
        const production = path.join(root, 'terraform', 'production');
        await execa('terraform', ['init', '--backend=false'], { cwd: production });
        await execa('terraform', ['validate'], { cwd: production });

        const staging = path.join(root, 'terraform', 'staging');
        await execa('terraform', ['init', '--backend=false'], { cwd: staging });
        await execa('terraform', ['validate'], { cwd: staging });
    });
});

describe('When running the generator with kubernetes deployment', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ deployment: 'kubernetes' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test']);
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a valid terraform config', async () => {
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
    });
});

describe('When running the generator with twig frontend and kubernetes deployment', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ deployment: 'kubernetes' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withPrompts({ twig: true })
            .withArguments(['test']);
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a Dockerfile that correctly builds', async () => {
        await execa('docker', ['build', 'test'], { cwd: root });
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
