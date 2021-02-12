import { Vault } from 'ansible-vault';

const encrypt = (password: string, secret: string): Promise<string> => {
    const vault = new Vault({ password });

    return vault.encrypt(secret);
};

export { encrypt };
