import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createEncrypt } from '../ansible';
import run from '../run';

test.each([
    ['foo', 'bar'],
    ['foo', 'azertyuiazertyu'],
    ['foo', 'azertyuiazertyui'],
    ['foo', 'azertyuiazertyuia'],
])('encrypt with password "%s" and secret "%s"', async (password, secret) => {
    const encrypted = createEncrypt(password)(secret);

    const dir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));

    await fs.promises.mkdir(dir);

    try {
        await fs.promises.writeFile(path.join(dir, 'password'), password);
        await fs.promises.writeFile(path.join(dir, 'encrypted'), encrypted);

        const decrypted = await run(
            'ansible-vault',
            ['decrypt', '--vault-password-file', 'password', '--output', '-', 'encrypted'],
            { cwd: dir },
        );

        expect(decrypted).toBe(secret);
    } finally {
        await fs.promises.rmdir(dir, { recursive: true });
    }
});
