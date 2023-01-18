import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import execa from 'execa';
import YAML from 'yaml';
import helpers, { RunResult } from 'yeoman-test';
import { Config } from '../../utils/circleci';
import createResolve from '../../utils/createResolve';

const resolve = createResolve(import.meta);

describe('When running the generator', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('../root'))
            .withAnswers({ contactEmail: 'test@example.com' })
            .run();

        await result.create(resolve('.'))
            .withArguments(['test'])
            .run();

        await execa(resolve(result.cwd, 'script', 'bootstrap'));
    });

    afterAll(async () => {
        await execa('docker', ['compose', 'down', '--rmi', 'local', '--volumes'], { cwd: result.cwd });

        result.cleanup();
    });

    const run = async (container: string, command: string, args: string[]): Promise<void> => {
        await execa('docker', ['compose', 'run', '--rm', '--no-deps', container, command, ...args], { cwd: result.cwd });
    };

    test('It generates a project which correctly builds', async () => {
        await run('test', 'yarn', ['build']);
    });

    test('It generates a project which correctly lints', async () => {
        await run('test', 'yarn', ['lint']);
    });

    test('It generates a project which correctly pass tests', async () => {
        await run('test', 'yarn', ['test']);
    });

    test('It generates a docker-compose.yaml with the right fields', async () => {
        const all = YAML.parse(await readFile(resolve(result.cwd, 'docker-compose.yaml'), 'utf8'));
        expect(all.version).toBeUndefined();
        expect(all.services.test).toBeDefined();
    });

    test('It extends the ansible configuration', async () => {
        const all = YAML.parse(await readFile(resolve(result.cwd, 'ansible/group_vars/all.yaml'), 'utf8'));

        expect(all.test_env).toBeDefined();
    });

    test('The database is correctly added to production config', async () => {
        const content = await readFile(resolve(result.cwd, 'terraform/common/database/main.tf'), 'utf8');

        expect(content).toContain('resource "scaleway_rdb_database" "test" {');
    });

    test('It generates a project with a valid terraform config', async () => {
        const production = resolve(result.cwd, 'terraform', 'production');
        await execa('terraform', ['init', '--backend=false'], { cwd: production });
        await execa('terraform', ['validate'], { cwd: production });

        const staging = resolve(result.cwd, 'terraform', 'staging');
        await execa('terraform', ['init', '--backend=false'], { cwd: staging });
        await execa('terraform', ['validate'], { cwd: staging });
    });
});

describe('When running the generator with kubernetes deployment', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('../root'))
            .withAnswers({ deployment: 'kubernetes' })
            .run();

        await result.create(resolve('.'))
            .withArguments(['test'])
            .run();
    });

    afterAll(async () => {
        result.cleanup();
    });

    test('It generates a valid CircleCI config', async () => {
        const content = await readFile(resolve(result.cwd, '.circleci', 'config.yml'), 'utf8');

        Config.fromRaw(YAML.parse(content));
    });

    test('It generates a valid terraform config', async () => {
        const cwd = resolve(result.cwd, 'environments', 'staging');

        await execa('terraform', ['init', '--backend=false'], { cwd });
        await execa('terraform', ['validate'], { cwd });
    });

    test('It generates a valid helm chart', async () => {
        const cwd = resolve(result.cwd, 'modules', 'deployment', 'chart');

        await execa('helm', ['lint'], { cwd });
    });

    test('It generates a Dockerfile that correctly builds', async () => {
        await execa('docker', ['build', 'test'], { cwd: result.cwd });
    });
});

describe('When running the generator with the path option', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('../root'))
            .withAnswers({ contactEmail: 'test@example.com' })
            .run();

        await result.create(resolve('.'))
            .withArguments(['test', '--path', 'packages/test'])
            .run();
    });

    afterAll(async () => {
        result.cleanup();
    });

    test('It generates the project in the given directory', async () => {
        expect(existsSync(resolve(result.cwd, 'packages/test'))).toBe(true);
    });
});
