import cryptoRandomString from 'crypto-random-string';
import { GeneratorOptions } from 'yeoman-generator';
import { createEncrypt } from '../../../utils/ansible';
import BaseGenerator from '../../../utils/BaseGenerator';
import varify from '../../../utils/varify';
import { DeploymentChoice } from '../../root';

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

        switch (this.config.get('deployment')) {
            case DeploymentChoice.Ansible:
                this.#writeAnsibleDeployment();
                break;
            case DeploymentChoice.Kubernetes:
                this.#writeKubernetesDeployment();
                break;
        }
    }

    #writeAnsibleDeployment() {
        const { packageName } = this.options;

        this.appendTemplate('deployment/ansible/staging.yaml.ejs', 'ansible/group_vars/staging.yaml', {
            // We use only alphanumeric characters in database password because special
            // characters often causes problems in configuration files
            databasePassword: cryptoRandomString({ length: 64, type: 'alphanumeric' }),
            encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
            packageName,
        });

        this.prependTemplate('deployment/ansible/provision.yaml.ejs', `ansible/packages/${packageName}/provision.yaml`, { packageName });

        if ([
            'terraform/common/database/main.tf',
            'terraform/common/database/outputs.tf',
            'terraform/production/outputs.tf',
        ].every(this.existsDestination.bind(this))) {
            this.appendTemplate('deployment/ansible/database.tf.ejs', 'terraform/common/database/main.tf', { packageName });
            this.appendTemplate('deployment/ansible/outputs.tf.ejs', 'terraform/common/database/outputs.tf', { packageName });
            this.replaceDestination(
                'terraform/production/outputs.tf',
                /(output "vars" {\n {4}value = {.*?)(\n {4}})/s,
                `$1\n        database_${varify(packageName)}_password = module.database.${varify(packageName)}_password$2`,
            );
        } else {
            this.log(
                'Skipping production database configuration because '
                + 'we couldn\'t find the expected directory structure.',
            );
        }
    }

    #writeKubernetesDeployment(): void {
        const { packageName } = this.options;

        this.appendTemplate('deployment/kubernetes/database.tf.ejs', 'modules/deployment/database.tf', { packageName });
        this.writeReleaseVariable(`${varify(packageName)}.database.host`, 'data.scaleway_rdb_instance.main.endpoint_ip');
        this.writeReleaseVariable(`${varify(packageName)}.database.port`, 'data.scaleway_rdb_instance.main.endpoint_port');
        this.writeReleaseVariable(`${varify(packageName)}.database.user`, `scaleway_rdb_user.${varify(packageName)}.name`);
        this.writeReleaseVariable(`${varify(packageName)}.database.password`, `random_password.${varify(packageName)}.result`);
        this.writeReleaseVariable(`${varify(packageName)}.database.name`, `scaleway_rdb_database.${varify(packageName)}.name`);
    }
}

export default DatabaseUtilGenerator;
