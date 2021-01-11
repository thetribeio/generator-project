import fs from 'fs';
import path from 'path';
import helpers from 'yeoman-test';
import run from '../../../utils/run';

describe('When running the generator', () => {
    let root: string;

    beforeAll(async () => {
        root = await helpers.run(path.resolve(__dirname, '../../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        await helpers.run(path.resolve(__dirname, '..'))
            .cd(root)
            .withOptions({ skipInstall: false })
            .withArguments(['test']);
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a project which correctly builds', async () => {
        await run('yarn', ['build'], { cwd: path.resolve(root, 'test') });
    });

    test('It generates a project which correctly lints', async () => {
        await run('yarn', ['lint'], { cwd: path.resolve(root, 'test') });
    });
});
