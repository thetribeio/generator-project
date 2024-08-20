import type { MemFsEditor } from 'mem-fs-editor';

type JsonValue = string|number|JsonArray|JsonObject;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const createJsonManipulator = (fs: MemFsEditor, path: string): JsonObject => new Proxy({}, {
    set(_, prop, value): boolean {
        fs.extendJSON(path, { [prop]: value });

        return true;
    },
});

export type { JsonObject };
export default createJsonManipulator;
