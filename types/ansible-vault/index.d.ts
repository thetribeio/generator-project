declare module 'ansible-vault' {
    export class Vault {
        constructor(options: { password: string })

        encrypt(secret: string, id?: string): Promise<string>
        decrypt(vault: string, id?: string): Promise<string>
    }
}
