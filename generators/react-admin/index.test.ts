import fs from 'fs';
import path from 'path';
import execa from 'execa';
import helpers from 'yeoman-test';

describe('When running the generator', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
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
        await run('test', 'yarn', ['build']);
    });

    test('It generates a project which correctly lints', async () => {
        await run('test', 'yarn', ['lint']);
    });

    test('It generates a project with react-admin', async () => {
        const packageJson = JSON.parse(await fs.promises.readFile(path.resolve(root, 'test', 'package.json'), 'utf8'));

        expect(packageJson.dependencies['react-admin']).toBeDefined();
    });
});
