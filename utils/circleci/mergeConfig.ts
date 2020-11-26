import Config from './Config';
import Workflow from './Workflow';

/**
 * Returns keys that are present in either objects
 */
const allKeys = (first: object, second: object): string[] => Array.from(new Set([...Object.keys(first), ...Object.keys(second)]));

/**
 * Merge two configs together
 */
const mergeConfig = (first: Config, second: Config): Config => new Config({
    version: first.version,
    jobs: {
        ...first.jobs,
        ...second.jobs,
    },
    workflowsVersion: first.workflowsVersion,
    workflows: Object.fromEntries(allKeys(first.workflows, second.workflows).map((workflowName: string): [string, Workflow] => {
        if (!(workflowName in first.workflows)) {
            return [workflowName, second.workflows[workflowName]];
        }

        if (!(workflowName in second.workflows)) {
            return [workflowName, first.workflows[workflowName]];
        }

        return [workflowName, new Workflow({
            jobs: {
                ...first.workflows[workflowName].jobs,
                ...second.workflows[workflowName].jobs,
            },
        })];
    })),
});

export default mergeConfig;
