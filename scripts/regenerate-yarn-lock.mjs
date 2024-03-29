#!/usr/bin/env node
import { cp, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import execa from 'execa';
import helpers from 'yeoman-test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const [, , ...generators] = process.argv;

await import('./build.mjs');

const { cwd: path } = await helpers.run(resolve(root, 'dist', 'generators', 'root'))
    .withPrompts({ contactEmail: 'test@example.com' });

for (const generator of generators) {
    await helpers.run(resolve(root, 'dist', 'generators', generator))
        .cd(path)
        .withPrompts(generator === 'symfony' ? { twig: true } : {})
        .withArguments([generator]);

    await execa('yarn', ['install'], { cwd: join(path, generator) });

    await cp(
        join(path, generator, 'yarn.lock'),
        join(root, 'generators', generator, 'templates',  generator === 'symfony' ? 'base-twig' : 'base', 'yarn.lock'),
    );
}

await rm(path,  { force: true, recursive: true })
