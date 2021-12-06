import { map } from 'ramda';
import Workflow from './Workflow';

interface ConfigConstructor {
    version: string;
    orbs?: {
        [name: string]: string,
    };
    executors?: {
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

    orbs: {
        [name: string]: string,
    };

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

    constructor({ version, orbs = {}, executors = {}, jobs, workflowsVersion, workflows }: ConfigConstructor) {
        this.version = version;
        this.orbs = orbs;
        this.executors = executors;
        this.jobs = jobs;
        this.workflowsVersion = workflowsVersion;
        this.workflows = workflows;
    }

    static fromRaw(raw: any): Config {
        const { version, orbs, executors, jobs, workflows: { version: workflowsVersion, ...workflows } } = raw;

        if ('2' !== workflowsVersion) {
            throw new Error(`Invalid workflows version: ${workflowsVersion}`);
        }

        // TODO: add more validation

        return new Config({
            version,
            orbs,
            executors,
            jobs,
            workflowsVersion,
            workflows: map<Record<string, any>, Record<string, Workflow>>(Workflow.fromRaw, workflows),
        });
    }

    toRaw(): any {
        const raw: any = {
            version: this.version,
        };

        if (Object.keys(this.orbs).length > 0) {
            raw.orbs = this.orbs;
        }

        if (Object.keys(this.executors).length > 0) {
            raw.executors = this.executors;
        }

        raw.jobs = this.jobs;
        raw.workflows = {
            version: this.workflowsVersion,
            ...map<Record<string, Workflow>, Record<string, any>>(
                (workflow: Workflow) => workflow.toRaw(),
                this.workflows,
            ),
        };

        return raw;
    }
}

export default Config;
