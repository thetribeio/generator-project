import cryptoRandomString from 'crypto-random-string';
import { createEncrypt } from '../../utils/ansible';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';

interface Options extends PackageGeneratorOptions {
    twig: boolean;
}

class SymfonyGenerator extends PackageGenerator<Options> {
    constructor(args: string | string[], opts: Options) {
        super(args, opts);

        this.option('twig', { type: Boolean });
    }

    initializing(): void {
        const { packageName } = this.options;

        this.composeWith(require.resolve('../utils/database'), [packageName]);
    }

    writing(): void {
        const { packageName, packagePath, twig } = this.options;

        this.renderTemplate('base', packagePath);

        this.renderTemplate(
            twig ? 'nginx-twig.conf.ejs' : 'nginx.conf.ejs',
            `nginx/docker/packages/${packageName}.conf`,
        );

        this.configureDockerCompose('docker-compose.yaml.ejs');

        this.configureCircleCI('circleci.yaml.ejs');

        if (twig) {
            this.renderTemplate('base-twig', packagePath);

            this.configureDockerCompose('docker-compose-twig.yaml.ejs');

            this.configureCircleCI('circleci-twig.yaml.ejs');
        }

        this.configureAnsible('ansible', {
            encrypt: createEncrypt(this.readDestination('ansible/vault_pass.txt').trim()),
            repositoryName: this.config.get('repositoryName'),
            secret: cryptoRandomString({ length: 64, type: 'alphanumeric' }),
            twig,
        });

        this.configureScripts('script', { twig });
    }
}

export default SymfonyGenerator;
