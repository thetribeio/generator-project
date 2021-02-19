import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

const run = (
    command: string,
    args: string[] = [],
    options: SpawnOptionsWithoutStdio = {},
): Promise<string> => new Promise((resolve, reject) => {
    const process = spawn(command, args, options);

    const out: Buffer[] = [];
    const err: Buffer[] = [];

    process.stdout.on('data', (data) => {
        out.push(data);
    });

    process.stderr.on('data', (data) => {
        err.push(data);
    });

    process.on('exit', (code) => {
        if (code === 0) {
            resolve(Buffer.concat(out).toString('utf8'));
        } else {
            reject(new Error(Buffer.concat(err).toString('utf8').trimEnd()));
        }
    });
});

export default run;
