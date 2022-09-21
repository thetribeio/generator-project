import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import helpers from 'yeoman-test';
import * as CircleCI from '../../utils/circleci';

describe('When running the generator with Create React App', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'create-react-app',
            });

        root = result.cwd;
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates an Express backend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'backend', 'package.json'), 'utf8'));

        expect(config.dependencies.express).toBeDefined();
    });

    test('It generates a Create React App frontend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'frontend', 'package.json'), 'utf8'));

        expect(config.dependencies['react-scripts']).toBeDefined();
    });

    test('It add the right dependencies to the deploy job', async () => {
        const content = await fs.promises.readFile(path.resolve(root, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        expect(config.workflows.build.jobs.deploy.requires).toEqual([
            'backend-archive',
            'frontend-archive',
        ]);
    });
});

describe('When running the generator with Next.js', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'next-js',
            });

        root = result.cwd;
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates an Express backend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'backend', 'package.json'), 'utf8'));

        expect(config.dependencies.express).toBeDefined();
    });

    test('It generates an Next.js frontend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'frontend', 'package.json'), 'utf8'));

        expect(config.dependencies.next).toBeDefined();
    });

    test('It add the right dependencies to the deploy job', async () => {
        const content = await fs.promises.readFile(path.resolve(root, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        expect(config.workflows.build.jobs.deploy.requires).toEqual([
            'backend-archive',
            'frontend-archive',
        ]);
    });
});

describe('When running the generator with Symfony', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: 'symfony',
                contactEmail: 'test@example.com',
                add: false,
                twig: true,
            });

        root = result.cwd;
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It add the right dependencies to the deploy job', async () => {
        const content = await fs.promises.readFile(path.resolve(root, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        expect(config.workflows.build.jobs.deploy.requires).toEqual([
            'backend-build',
        ]);
    });
});

describe('When running the generator with Flutter', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                projectName: 'my_project',
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'flutter',
                applicationPrefix: 'com.example',
                applicationDisplayName: 'My Project',
            });

        root = result.cwd;
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    it('It generates a Flutter mobile app', async () => {
        const config = YAML.parse(await fs.promises.readFile(
            path.resolve(
                root,
                'mobile',
                'pubspec.yaml',
            ),
            'utf8',
        ));

        expect(config).toBeDefined();
    });
});

describe('When running the generator with React-Native', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                projectName: 'my_project',
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'react-native',
                applicationPrefix: 'com.example',
                applicationDisplayName: 'My Project',
            });

        root = result.cwd;
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    it('It generates a React-Native mobile app', async () => {
        const config = YAML.parse(await fs.promises.readFile(
            path.resolve(
                root,
                'mobile',
                'package.json',
            ),
            'utf8',
        ));

        expect(config).toBeDefined();
    });
});

describe('When running the generator without a Backend', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: null,
                contactEmail: 'test@example.com',
                type: 'create-react-app',
            });

        root = result.cwd;
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    it('It doesn\'t create a backend directory', async () => {
        expect(fs.existsSync(path.resolve(root, 'backend'))).toBe(false);
    });
});
