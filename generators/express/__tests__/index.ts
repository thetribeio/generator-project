import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import fs from 'fs';
import path from 'path';
import helpers from 'yeoman-test';

const run = (command: string, args: string[], options: SpawnOptionsWithoutStdio): Promise<void> => new Promise((resolve, reject) => {
    const process = spawn(command, args, options);

    const err: Buffer[] = [];

    process.stderr.on('data', (data) => {
        err.push(data);
    });

    process.on('exit', (code) => {
        if (code === 0) {
            resolve();
        } else {
            reject(new Error(Buffer.concat(err).toString('utf8')));
        }
    });
});

describe('When running the generator', () => {
    let root: string;

    beforeAll(async () => {
        root = await helpers.run(path.resolve(__dirname, '../../root'));

        await helpers.run(path.resolve(__dirname, '..')).cd(root).withArguments(['test']);
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a project with a valid lockfile in the backend directory', async () => {
        await run('yarn', ['install', '--frozen-lockfile'], { cwd: path.resolve(root, 'test') });
    });
});
