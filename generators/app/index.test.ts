import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import YAML from 'yaml';
import helpers, { RunResult } from 'yeoman-test';
import * as CircleCI from '../../utils/circleci';
import createResolve from '../../utils/createResolve';

const resolve = createResolve(import.meta);

describe('When running the generator with React', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('.'))
            .withAnswers({
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'react',
            })
            .run();
    });

    afterAll(() => {
        result.cleanup();
    });

    test('It generates an Express backend', async () => {
        const config = JSON.parse(await readFile(resolve(result.cwd, 'backend', 'package.json'), 'utf8'));

        expect(config.dependencies.express).toBeDefined();
    });

    test('It generates a React frontend', async () => {
        const config = JSON.parse(await readFile(resolve(result.cwd, 'frontend', 'package.json'), 'utf8'));

        expect(config.devDependencies.vite).toBeDefined();
    });

    test('It add the right dependencies to the deploy job', async () => {
        const content = await readFile(resolve(result.cwd, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        expect(config.workflows.build?.jobs.deploy?.requires).toEqual([
            'backend-archive',
            'frontend-archive',
        ]);
    });
});

describe('When running the generator with Next.js', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('.'))
            .withAnswers({
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'next-js',
            })
            .run();
    });

    afterAll(async () => {
        result.cleanup();
    });

    test('It generates an Express backend', async () => {
        const config = JSON.parse(await readFile(resolve(result.cwd, 'backend', 'package.json'), 'utf8'));

        expect(config.dependencies.express).toBeDefined();
    });

    test('It generates an Next.js frontend', async () => {
        const config = JSON.parse(await readFile(resolve(result.cwd, 'frontend', 'package.json'), 'utf8'));

        expect(config.dependencies.next).toBeDefined();
    });

    test('It add the right dependencies to the deploy job', async () => {
        const content = await readFile(resolve(result.cwd, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        expect(config.workflows.build?.jobs.deploy?.requires).toEqual([
            'backend-archive',
            'frontend-archive',
        ]);
    });
});

describe('When running the generator with Symfony', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('.'))
            .withAnswers({
                backend: 'symfony',
                contactEmail: 'test@example.com',
                add: false,
                twig: true,
            })
            .run();
    });

    afterAll(async () => {
        result.cleanup()
    });

    test('It add the right dependencies to the deploy job', async () => {
        const content = await readFile(resolve(result.cwd, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        expect(config.workflows.build?.jobs.deploy?.requires).toEqual([
            'backend-build',
        ]);
    });
});

describe('When running the generator with Flutter', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('.'))
            .withAnswers({
                projectName: 'my_project',
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'flutter',
                applicationPrefix: 'com.example',
                applicationDisplayName: 'My Project',
            })
            .run();
    });

    afterAll(async () => {
        result.cleanup();
    });

    it('It generates a Flutter mobile app', async () => {
        const config = YAML.parse(await readFile(resolve(result.cwd, 'mobile', 'pubspec.yaml'), 'utf8'));

        expect(config).toBeDefined();
    });
});

describe('When running the generator with React-Native', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('.'))
            .withAnswers({
                projectName: 'my_project',
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'react-native',
                applicationPrefix: 'com.example',
                applicationDisplayName: 'My Project',
            })
            .run();
    });

    afterAll(async () => {
        result.cleanup();
    });

    it('It generates a React-Native mobile app', async () => {
        const config = YAML.parse(await readFile(resolve(result.cwd, 'mobile', 'package.json'), 'utf8'));

        expect(config).toBeDefined();
    });
});

describe('When running the generator without a Backend', () => {
    let result: RunResult;

    beforeAll(async () => {
        result = await helpers.create(resolve('.'))
            .withAnswers({
                backend: null,
                contactEmail: 'test@example.com',
                type: 'create-react-app',
            })
            .run();
    });

    afterAll(async () => {
        result.cleanup();
    });

    it('It doesn\'t create a backend directory', async () => {
        expect(existsSync(resolve(result.cwd, 'backend'))).toBe(false);
    });
});
