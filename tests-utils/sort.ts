import { partition } from 'ramda';

const isExecutable = (jobs: Record<string, Record<string, any>>, executed: string[]) => (name: string) => {
    const { requires = [] }: { requires?: string[] } = jobs[name];

    const remainingRequires = requires.filter((require) => !executed.includes(require));

    return remainingRequires.length === 0;
}

const sort = (jobs: Record<string, Record<string, any>>) => {
    let [executable, remaining] = partition(isExecutable(jobs, []), Object.keys(jobs));

    let sorted: string[] = [];

    while (executable.length > 0) {
        let node;
        [node, ...executable] = executable;

        sorted = [...sorted, node];

        let newlyExecutable;
        [newlyExecutable, remaining] = partition(isExecutable(jobs, sorted), remaining);

        executable = [...executable, ...newlyExecutable];
    }

    if (remaining.length > 0) {
        throw new Error('Invalid dependency graph');
    }

    return sorted;
}

export default sort;
