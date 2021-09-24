import cryptoRandomString from 'crypto-random-string';
import { GeneratorOptions } from 'yeoman-generator';
import { createEncrypt } from '../../../utils/ansible';
import BaseGenerator from '../../../utils/BaseGenerator';

interface DatabaseUtilGeneratorOptions extends GeneratorOptions {
    packageName: string;
}

class DatabaseUtilGenerator extends BaseGenerator<DatabaseUtilGeneratorOptions> {
    constructor(args: string | string[], opts: DatabaseUtilGeneratorOptions) {
        super(args, opts);

        this.argument('packageName', { type: String, required: true });
    }

    writing(): void {
        const { packageName } = this.options;

        this.renderTemplate('database.sql.ejs', `postgres/docker/initdb.d/${packageName}.sql`, { packageName });

        this.appendTemplate('staging.yaml.ejs', 'ansible/group_vars/staging.yaml', {
            // We use only alphanumeric characters in database password because special
            // characters often causes problems in configuration files
            databasePassword: cryptoRandomString({ length: 64, type: 'alphanumeric' }),
            encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
            packageName,
        });

        this.prependTemplate('provision.yaml.ejs', `ansible/packages/${packageName}/provision.yaml`, { packageName });
    }
}

export default DatabaseUtilGenerator;
