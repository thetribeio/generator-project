import { strict as assert } from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import execa from 'execa';
import { createEncrypt } from './ansible';

for (const [password, secret] of [
    ['foo', 'bar'],
    ['foo', 'azertyuiazertyu'],
    ['foo', 'azertyuiazertyui'],
    ['foo', 'azertyuiazertyuia'],
] as const) {
    test(`encrypt with password "${password}" and secret "${secret}"`, async () => {
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

            assert.equal(decrypted, secret);
        } finally {
            await fs.promises.rm(dir, { recursive: true });
        }
    });
}
