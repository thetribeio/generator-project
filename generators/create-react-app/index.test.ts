import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import helpers from 'yeoman-test';
import { Config } from '../../utils/circleci';
import Executor from '../../tests-utils/execute';

describe('When running the generator', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({ contactEmail: 'test@example.com' });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test']);
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a project which correctly pass the CI', async () => {
        const configPath = path.resolve(root, '.circleci/config.yml');
        const config = Config.fromRaw(YAML.parse(await fs.promises.readFile(configPath, 'utf8')));

        // Ignore release job since it requires pushing to a running sentry instance
        delete config.workflows.build.jobs['test-sentry-release'];

        await new Executor().execute(config, 'build', root);
    });

    test('It generates a docker-compose.yaml with a version fields', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'docker-compose.yaml'), 'utf8'));

        expect(all.version).toBeDefined();
    });

    test('It extends the ansible configuration', async () => {
        const all = YAML.parse(await fs.promises.readFile(path.resolve(root, 'ansible/group_vars/all.yaml'), 'utf8'));

        expect(all.test_data).toBeDefined();
    });
});
