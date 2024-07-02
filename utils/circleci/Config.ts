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
    commands?: {
        [name: string]: any,
    }
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

    commands: {
        [name: string]: any,
    };

    jobs: {
        [name: string]: Record<string, any>,
    };

    workflowsVersion: '2';

    workflows: {
        [name: string]: Workflow,
    };

    constructor({
        version,
        orbs = {},
        executors = {},
        commands = {},
        jobs,
        workflowsVersion,
        workflows,
    }: ConfigConstructor) {
        this.version = version;
        this.orbs = orbs;
        this.executors = executors;
        this.commands = commands;
        this.jobs = jobs;
        this.workflowsVersion = workflowsVersion;
        this.workflows = workflows;
    }

    static fromRaw({
        version,
        orbs,
        executors,
        commands,
        jobs,
        workflows: { version: workflowsVersion, ...workflows },
    }: any): Config {
        if ('2' !== workflowsVersion) {
            throw new Error(`Invalid workflows version: ${workflowsVersion}`);
        }

        // TODO: add more validation

        return new Config({
            version,
            orbs,
            executors,
            commands,
            jobs,
            workflowsVersion,
            workflows: map(Workflow.fromRaw, workflows as Record<string, any>),
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

        if (Object.keys(this.commands).length > 0) {
            raw.commands = this.commands;
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
