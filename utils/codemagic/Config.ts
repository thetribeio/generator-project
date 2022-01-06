import { map } from 'ramda';
import Workflow from './Workflow';

interface ConfigConstructor {
    workflows: {
        [name: string]: Workflow,
    };
}

class Config {
    workflows: {
        [name: string]: Workflow,
    };

    constructor({ workflows }: ConfigConstructor) {
        this.workflows = workflows;
    }

    static fromRaw(raw: any): Config {
        const { workflows } = raw;

        // TODO: add some validation ?

        return new Config({
            workflows: workflows as Record<string, Workflow>,
        });
    }

    toRaw(): any {
        return {
            workflows: map<Record<string, Workflow>, Record<string, any>>(
                (workflow: Workflow) => workflow,
                this.workflows,
            ),
        };
    }
}

export default Config;
