import type { Editor } from 'mem-fs-editor';
import createJsonManipulator, { JsonObject } from './json';

type Resolve = (...path: string[]) => string;

interface Filesystem {
    [path: `${string}.json`]: JsonObject;
}

const createFilesystemManipulator = (fs: Editor, resolve: Resolve): Filesystem => new Proxy({}, {
    get(_, path): any|undefined {
        if (typeof path !== 'string') {
            return undefined;
        }

        if (path.endsWith('.json')) {
            return createJsonManipulator(fs, resolve(path));
        }

        throw new Error('Unsupported file type');
    },
});

export type { Filesystem };
export default createFilesystemManipulator;
