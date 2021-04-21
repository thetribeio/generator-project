import { Writable, Readable } from 'stream';

const createPair = (): [Readable, Writable] => {
    let readableCallback: ((error?: Error|null|undefined) => void)|null = null;

    const readable = new Readable();
    readable._read = function _read() {
        if (!readableCallback) return;
        const callback = readableCallback;
        readableCallback = null;
        callback();
    }

    const writable = new Writable();
    writable._write = function _write(chunk, enc, callback) {
        if (readableCallback) throw new Error;
        if (chunk.length === 0) {
            process.nextTick(callback);
        } else {
            readableCallback = callback;
            readable.push(chunk);
        }
    }
    writable._final = function _final(callback) {
        readable.on('end', callback);
        readable.push(null);
    }

    return [readable, writable];
};

export default createPair;
