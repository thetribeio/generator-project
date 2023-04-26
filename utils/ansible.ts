import crypto from 'crypto';
import { hexlify } from 'binascii';

const HEADER = '$ANSIBLE_VAULT';
const AES256 = 'AES256';
const CIPHER = 'aes-256-ctr';
const DIGEST = 'sha256';

const deriveKey = (salt: Buffer, password: string): { key: Buffer, hmacKey: Buffer, iv: Buffer } => {
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 80, DIGEST);
    const key = derivedKey.slice(0, 32);
    const hmacKey = derivedKey.slice(32, 64);
    const iv = derivedKey.slice(64, 80);

    return {
        key,
        hmacKey,
        iv,
    };
};

const pad = (messageLength: number, blocksize: number): Buffer => {
    if (blocksize > 256) {
        throw new Error('can\'t pad blocks larger 256 bytes');
    }

    const padLength = blocksize - (messageLength % blocksize);

    return Buffer.alloc(padLength, Buffer.from(new Uint8Array([padLength])));
};

const hmac = (key: Buffer, ciphertext: Buffer): Buffer => crypto.createHmac(DIGEST, key)
    .update(ciphertext)
    .digest();

const createEncrypt = (password: string): (secret: string) => string => {
    const encrypt = (secret: string): string => {
        const salt = crypto.randomBytes(32);
        const { key, hmacKey, iv } = deriveKey(salt, password);

        const cipherF = crypto.createCipheriv(CIPHER, key, iv);
        const ciphertext = Buffer.concat([
            cipherF.update(secret),
            cipherF.update(pad(secret.length, 16)),
            cipherF.final(),
        ]);

        const hex = [
            salt,
            hmac(hmacKey, ciphertext),
            ciphertext,
        ].map((buffer) => buffer.toString('hex')).join('\n');

        return `${HEADER};1.1;${AES256}\n${hexlify(hex).match(/.{1,80}/g).join('\n')}`;
    };

    return encrypt;
};

export { createEncrypt };
