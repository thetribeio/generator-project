import fs from 'fs';
import path from 'path';
import helpers from 'yeoman-test';

describe('When running the generator with Create React App', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '..'))
            .withPrompts({ contactEmail: 'test@example.com', frontend: 'create-react-app' });

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
        const result = await helpers.run(path.resolve(__dirname, '..'))
            .withPrompts({ contactEmail: 'test@example.com', frontend: 'next-js' });

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
