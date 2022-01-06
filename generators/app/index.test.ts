import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import helpers from 'yeoman-test';

describe('When running the generator with Create React App', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                backend: 'express',
                contactEmail: 'test@example.com',
                frontend: 'create-react-app',
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
});

describe('When running the generator with Next.js', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({ backend: 'express', contactEmail: 'test@example.com', frontend: 'next-js' });

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
});

describe('When running the generator with Flutter', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(__dirname)
            .withPrompts({
                projectName: 'my_project',
                backend: 'express',
                contactEmail: 'test@example.com',
                frontend: 'next-js',
                mobile: 'flutter',
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
