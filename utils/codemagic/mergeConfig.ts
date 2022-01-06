import Config from './Config';

/**
 * Merge two configs together
 */
const mergeConfig = (first: Config, second: Config): Config => new Config({
    workflows: Object.fromEntries([
        ...Object.entries(first.workflows),
        ...Object.entries(second.workflows),
    ]),
});

export default mergeConfig;
