interface WorkflowConstructor {
    jobs: {
        [name: string]: Record<string, any>,
    }
}

class Workflow {
    jobs: {
        [name: string]: Record<string, any>,
    }

    constructor({ jobs }: WorkflowConstructor) {
        this.jobs = jobs;
    }

    static fromRaw(raw: any): Workflow {
        const { jobs } = raw;

        // TODO: add validation

        return new Workflow({
            jobs: Object.fromEntries(jobs.map((rawJob: any) => {
                if ('string' === typeof rawJob) {
                    return [rawJob, {}];
                }

                return Object.entries(rawJob)[0];
            })),
        });
    }

    toRaw(): any {
        return {
            jobs: Object.entries(this.jobs).map(([name, config]) => (Object.keys(config).length === 0 ? name : { [name]: config })),
        };
    }
}

export default Workflow;
