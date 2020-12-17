import fs from 'fs';
import path from 'path';
import helpers from 'yeoman-test';

describe('When running the generator with Create React App', () => {
    let root: string;

    beforeAll(async () => {
        root = await helpers.run(path.resolve(__dirname, '..'))
            .withPrompts({ frontend: 'create-react-app' });
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates an Express backend', async () => {
        const config = JSON.parse(await fs.promises.readFile(path.resolve(root, 'backend', 'package.json'), 'utf8'));

        expect(config.dependencies.express).toBeDefined();
    });
});

describe('When running the generator with Next.js', () => {
    let root: string;

    beforeAll(async () => {
        root = await helpers.run(path.resolve(__dirname, '..'))
            .withPrompts({ frontend: 'next-js' });
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
