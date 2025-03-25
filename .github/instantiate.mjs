import fs from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const [, , generator, path] = process.argv;

await fs.promises.mkdir(path, { recursive: true });

await helpers.run(resolve(root, 'dist', 'generators', 'root'))
    .cd(path)
    .withPrompts({ contactEmail: 'test@example.com' });

await helpers.run(resolve(root, 'dist', 'generators', generator))
    .cd(path)
    .withArguments(['test']);
