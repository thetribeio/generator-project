import fs from 'fs';
import path from 'path';
import execa from 'execa';
import YAML from 'yaml';
import helpers from 'yeoman-test';

describe('When running the generator', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(path.resolve(__dirname, '..'))
            .cd(root)
            .withOptions({ skipInstall: false })
            .withArguments(['test']);
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a project which correctly builds', async () => {
        await execa('yarn', ['build'], { cwd: path.resolve(root, 'test') });
    });

    test('It generates a docker-compose.yaml with a version fields', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'docker-compose.yaml'), 'utf8'));

        expect(all.version).toBeDefined();
    });
});
