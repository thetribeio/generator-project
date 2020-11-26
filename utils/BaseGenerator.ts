import ejs, { Data } from 'ejs';
import YAML from 'yaml';
import Generator from 'yeoman-generator';
import { Config, mergeConfig } from './circleci';

interface ContainerConfig {
    build: string,
    volumes: string[],
}

class BaseGenerator extends Generator {
    configureContainer(name: string, config: ContainerConfig) {
        const oldConfig = YAML.parse(this.readDestination('docker-compose.yaml'));

        const newConfig = {
            ...oldConfig,
            services: {
                ...oldConfig.services,
                [name]: config,
            },
        };

        this.writeDestination('docker-compose.yaml', YAML.stringify(newConfig, { indent: 4 }));
    }

    async configureCircleCI(templatePath: string, context: Data) {
        const config = YAML.parse(await ejs.renderFile(templatePath, context));

        const oldConfig = YAML.parse(this.readDestination('.circleci/config.yml'));

        const newConfig = mergeConfig(Config.fromRaw(oldConfig), Config.fromRaw(config)).toRaw();

        this.writeDestination('.circleci/config.yml', YAML.stringify(newConfig, { indent: 2 }));
    }
}

export default BaseGenerator;
