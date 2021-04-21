import { Readable, Writable } from 'stream';

const pipe = (from: Readable, to: Writable): Promise<void> => new Promise((resolve, reject) => {
    from.pipe(to);

    from.on('end', resolve);
    from.on('error', reject);

    to.on('error', reject);
});

export default pipe;
