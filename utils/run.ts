import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

const run = (
    command: string,
    args: string[],
    options: SpawnOptionsWithoutStdio,
): Promise<void> => new Promise((resolve, reject) => {
    const process = spawn(command, args, options);

    const err: Buffer[] = [];

    process.stderr.on('data', (data) => {
        err.push(data);
    });

    process.on('exit', (code) => {
        if (code === 0) {
            resolve();
        } else {
            reject(new Error(Buffer.concat(err).toString('utf8')));
        }
    });
});

export default run;
