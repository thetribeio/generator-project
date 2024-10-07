import { readFile, writeFile } from 'node:fs/promises';

export default async function(path, regexp, replacer) {
    const content = await readFile(path, 'utf8');

    const newContent = content.replace(regexp, replacer);

    if (newContent === content) {
        return false;
    }

    await writeFile(path, newContent, 'utf8');

    return true;
};
