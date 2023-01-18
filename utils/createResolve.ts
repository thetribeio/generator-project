import { resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * Create a resolve function that uses the current file as default instead of cwd.
 */
const createResolve = (meta: ImportMeta) => {
    const root = fileURLToPath(meta.url);

    return (...segments: string[]) => resolve(root, ...segments);
};

export default createResolve;
