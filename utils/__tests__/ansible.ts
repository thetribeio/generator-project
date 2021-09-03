import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import execa from 'execa';
import { createEncrypt } from '../ansible';

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

        const { stdout: decrypted } = await execa(
            'ansible-vault',
            ['decrypt', '--vault-password-file', 'password', '--output', '-', 'encrypted'],
            { cwd: dir },
        );

        expect(decrypted).toBe(secret);
    } finally {
        await fs.promises.rm(dir, { recursive: true });
    }
});
