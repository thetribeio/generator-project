import { map } from 'ramda';
import Workflow from './Workflow';

interface ConfigConstructor {
    version: string;
    executors: {
        [name: string]: Record<string, any>,
    };
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

    executors: {
        [name: string]: Record<string, any>,
    };

    jobs: {
        [name: string]: Record<string, any>,
    };

    workflowsVersion: '2';

    workflows: {
        [name: string]: Workflow,
    };

    constructor({ version, executors, jobs, workflowsVersion, workflows }: ConfigConstructor) {
        this.version = version;
        this.executors = executors;
        this.jobs = jobs;
        this.workflowsVersion = workflowsVersion;
        this.workflows = workflows;
    }

    static fromRaw(raw: any): Config {
        const { version, executors, jobs, workflows: { version: workflowsVersion, ...workflows } } = raw;

        if ('2' !== workflowsVersion) {
            throw new Error(`Invalid workflows version: ${workflowsVersion}`);
        }

        // TODO: add more validation

        return new Config({
            version,
            executors,
            jobs,
            workflowsVersion,
            workflows: map<Record<string, any>, Record<string, Workflow>>(Workflow.fromRaw, workflows),
        });
    }

    toRaw(): any {
        return {
            version: this.version,
            executors: this.executors,
            jobs: this.jobs,
            workflows: {
                version: this.workflowsVersion,
                ...map<Record<string, Workflow>, Record<string, any>>((workflow: Workflow) => workflow.toRaw(), this.workflows),
            },
        };
    }
}

export default Config;
