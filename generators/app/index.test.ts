import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import YAML from 'yaml';
import helpers from 'yeoman-test';
import * as CircleCI from '../../utils/circleci';

describe('When running the generator with React', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'react',
            });

        root = result.cwd;
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates an Express backend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'backend', 'package.json'), 'utf8'));

        assert.ok(config.dependencies.express);
    });

    test('It generates a React frontend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'frontend', 'package.json'), 'utf8'));

        assert.ok(config.devDependencies.vite);
    });

    test('It adds the right dependencies to the deploy job', async () => {
        const content = await fs.promises.readFile(path.resolve(root, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        assert.deepEqual(config.workflows.build?.jobs.deploy?.requires, [
            'backend-archive',
            'frontend-archive',
        ]);
    });
});

describe('When running the generator with Next.js', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: 'express',
                contactEmail: 'test@example.com',
                type: 'next-js',
            });

        root = result.cwd;
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates an Express backend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'backend', 'package.json'), 'utf8'));

        assert.ok(config.dependencies.express);
    });

    test('It generates an Next.js frontend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'frontend', 'package.json'), 'utf8'));

        assert.ok(config.dependencies.next);
    });

    test('It adds the right dependencies to the deploy job', async () => {
        const content = await fs.promises.readFile(path.resolve(root, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        assert.deepEqual(config.workflows.build?.jobs.deploy?.requires, [
            'backend-archive',
            'frontend-archive',
        ]);
    });
});

describe('When running the generator with Symfony', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: 'symfony',
                contactEmail: 'test@example.com',
                add: false,
                twig: true,
            });

        root = result.cwd;
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It adds the right dependencies to the deploy job', async () => {
        const content = await fs.promises.readFile(path.resolve(root, '.circleci', 'config.yml'), 'utf8');
        const config = CircleCI.Config.fromRaw(YAML.parse(content));

        assert.deepEqual(config.workflows.build?.jobs.deploy?.requires, [
            'backend-build',
        ]);
    });
});

describe('When running the generator with Flutter', () => {
    let root: string;

    before(async () => {
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

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a Flutter mobile app', async () => {
        const config = YAML.parse(await fs.promises.readFile(
            path.resolve(
                root,
                'mobile',
                'pubspec.yaml',
            ),
            'utf8',
        ));

        assert.ok(config);
    });
});

describe('When running the generator with React-Native', () => {
    let root: string;

    before(async () => {
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

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a React-Native mobile app', async () => {
        const config = YAML.parse(await fs.promises.readFile(
            path.resolve(
                root,
                'mobile',
                'package.json',
            ),
            'utf8',
        ));

        assert.ok(config);
    });
});

describe('When running the generator without a Backend', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: null,
                contactEmail: 'test@example.com',
                type: 'create-react-app',
            });

        root = result.cwd;
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It doesn\'t create a backend directory', async () => {
        assert.ok(!fs.existsSync(path.resolve(root, 'backend')));
    });
});
