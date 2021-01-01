import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const generateSecretKey = (salt: string): Buffer => {
    const hash = createHash('sha1');

    hash.update(salt);

    return hash.digest().slice(0, 16);
};

export const aesEncrypt = (data: string, key: Buffer, iv: Buffer): string => {
    const cipher = createCipheriv('aes-128-cbc', key, iv);
    let result = cipher.update(data, 'utf8', 'hex');

    result += cipher.final('hex');

    return result;
};

export function encryptPwd(data: string, salt: string): { key: string; result: string; iv: string } {
    const iv = randomBytes(16);
    const secretKey = generateSecretKey(salt);
    const result = aesEncrypt(data, secretKey, iv);

    return { result, key: secretKey.toString('hex'), iv: iv.toString('hex') };
}

export function aesDecrypt(encrypted: string, secretKey: string, iv: string) {
    const decipher = createDecipheriv('aes-128-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
}
