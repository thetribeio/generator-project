class InvalidRangeError extends Error {
    constructor(range?: string) {
        super(`Invalid range error ${range}`);
    }
}

const parseRange = (range: string | string[] | undefined): [number, number] | null => {
    if (!range) {
        return null;
    }

    if (typeof range !== 'string') {
        throw new InvalidRangeError();
    }

    const result = /^[^=]+=(\d+)-(\d+)$/.exec(range);

    if (!result) {
        throw new InvalidRangeError(range);
    }

    const [, start, end] = result;
    if (!start || !end) {
        throw new InvalidRangeError(range);
    }

    return [parseInt(start, 10), parseInt(end, 10)];
};

export { InvalidRangeError };
export default parseRange;
