import { map } from 'ramda';
import Workflow from './Workflow';

interface ConfigConstructor {
    version: string;
    jobs: {
        [name: string]: Record<string, any>,
    };
    workflowsVersion: '2';
    workflows: {
        [name: string]: Workflow,
    };
}

class Config {
    version: string;

    jobs: {
        [name: string]: Record<string, any>,
    };

    workflowsVersion: '2';

    workflows: {
        [name: string]: Workflow,
    };

    constructor({ version, jobs, workflowsVersion, workflows }: ConfigConstructor) {
        this.version = version;
        this.jobs = jobs;
        this.workflowsVersion = workflowsVersion;
        this.workflows = workflows;
    }

    static fromRaw(raw: any): Config {
        const { version, jobs, workflows: { version: workflowsVersion, ...workflows } } = raw;

        if ('2' !== workflowsVersion) {
            throw new Error(`Invalid workflows version: ${workflowsVersion}`);
        }

        // TODO: add more validation

        return new Config({
            version,
            jobs,
            workflowsVersion,
            workflows: map<Record<string, any>, Record<string, Workflow>>(Workflow.fromRaw, workflows),
        });
    }

    toRaw(): any {
        return {
            version: this.version,
            jobs: this.jobs,
            workflows: {
                version: this.workflowsVersion,
                ...map<Record<string, Workflow>, Record<string, any>>((workflow: Workflow) => workflow.toRaw(), this.workflows),
            },
        };
    }
}

export default Config;
