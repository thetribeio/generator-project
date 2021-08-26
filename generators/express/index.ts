import cryptoRandomString from 'crypto-random-string';
import PackageGenerator from '../../utils/PackageGenerator';

class ExpressGenerator extends PackageGenerator {
    async writing() {
        const { packageName, packagePath } = this.options;

        // We use only alphanumeric characters in database password because special
        // characters often causes problems in configuration files
        const databasePassword = cryptoRandomString({ length: 64, type: 'alphanumeric' });

        this.renderTemplate('base', packagePath, undefined, undefined, { globOptions: { dot: true } });

        this.renderTemplate('nginx.conf.ejs', `nginx/docker/packages/${packageName}.conf`);
        this.renderTemplate('database.sql.ejs', `postgres/docker/initdb.d/${packageName}.sql`);

        await this.configureDockerCompose('docker-compose.yaml.ejs');

        await this.configureCircleCI('circleci.yaml.ejs');

        await this.configureAnsible('ansible', {
            databasePassword,
            repositoryName: this.config.get('repositoryName'),
        });

        await this.configureScripts('script');
    }
}

export default ExpressGenerator;
