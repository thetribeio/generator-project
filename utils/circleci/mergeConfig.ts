import Config from './Config';
import Workflow from './Workflow';

/**
 * Returns keys that are present in either objects
 */
const allKeys = (first: object, second: object): string[] => Array.from(new Set([
    ...Object.keys(first),
    ...Object.keys(second),
]));

/**
 * Merge two configs together
 */
const mergeConfig = (first: Config, second: Config): Config => new Config({
    version: first.version,
    orbs: {
        ...first.orbs,
        ...second.orbs,
    },
    executors: {
        ...first.executors,
        ...second.executors,
    },
    commands: {
        ...first.commands,
        ...second.commands,
    },
    jobs: {
        ...first.jobs,
        ...second.jobs,
    },
    workflowsVersion: first.workflowsVersion,
    workflows: Object.fromEntries(allKeys(first.workflows, second.workflows)
        .map((workflowName: string): [string, Workflow] => {
            const firstWorkflow = first.workflows[workflowName];
            const secondWorkflow = second.workflows[workflowName];

            return [workflowName, new Workflow({
                jobs: {
                    ...firstWorkflow ? firstWorkflow.jobs : {},
                    ...secondWorkflow ? secondWorkflow.jobs : {},
                },
            })];
        })),
});

export default mergeConfig;
