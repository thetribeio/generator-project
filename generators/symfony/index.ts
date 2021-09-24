import cryptoRandomString from 'crypto-random-string';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';

interface Options extends PackageGeneratorOptions {
    twig: boolean;
}

class SymfonyGenerator extends PackageGenerator<Options> {
    constructor(args: string | string[], opts: Options) {
        super(args, opts);

        this.option('twig', { type: Boolean });
    }

    async writing() {
        const { packageName, packagePath } = this.options;

        // We use only alphanumeric characters in database password because special
        // characters often causes problems in configuration files
        const databasePassword = cryptoRandomString({ length: 64, type: 'alphanumeric' });

        this.renderTemplate('base', packagePath);

        this.renderTemplate('nginx.conf.ejs', `nginx/docker/packages/${packageName}.conf`);
        this.renderTemplate('database.sql.ejs', `postgres/docker/initdb.d/${packageName}.sql`);

        await this.configureDockerCompose('docker-compose.yaml.ejs');

        await this.configureCircleCI('circleci.yaml.ejs');

        if (this.options.twig) {
            this.renderTemplate('base-twig', packagePath);

            await this.configureDockerCompose('docker-compose-twig.yaml.ejs');

            await this.configureCircleCI('circleci-twig.yaml.ejs');
        }

        await this.configureAnsible('ansible', {
            databasePassword,
            repositoryName: this.config.get('repositoryName'),
            twig: this.options.twig,
        });

        await this.configureScripts('script', { twig: this.options.twig });
    }
}

export default SymfonyGenerator;
