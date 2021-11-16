#!/usr/bin/env node
import { copyFile, mkdir, rm } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import execa from 'execa';

const glob = promisify((await import('glob')).default);

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

// Reset dist directory
await rm(dist, { force: true, recursive: true });
await mkdir(dist);

// Compile TS files
await execa('./node_modules/.bin/tsc', ['--project', 'tsconfig.build.json'], { cwd: root });

// Copy templates
for (const files of ['generators/*/templates/**/*', 'generators/utils/*/templates/**/*']) {
    for (const relativePath of await glob(files, {
        dot: true,
        ignore: ['**/node_modules/**', '**/vendor/**'],
        nodir: true,
        cwd: root,
    })) {
        let distPath = join(dist, relativePath);

        if (basename(relativePath) === '.gitignore') {
            distPath = `${dirname(distPath)}/gitignore`;
        }

        await mkdir(dirname(distPath), { recursive: true });
        await copyFile(join(root, relativePath), distPath);
    }
}

// Copy root ressources
for (const file of ['package.json', 'README.md']) {
    await copyFile(join(root, file), join(dist, file));
}
