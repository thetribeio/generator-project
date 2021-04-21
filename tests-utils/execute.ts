import fs from 'fs';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import Docker from 'dockerode';
import tar from 'tar';
import { v4 as uuidv4 } from 'uuid';
import Config from '../utils/circleci/Config';
import sort from './sort';
import createPair from './createPair';
import pipe from './pipe';

const normalizePath = (path: string): string => path.replace(/^~\//, '/home/circleci/');

class Executor {
    #docker: Docker;

    constructor() {
        this.#docker = new Docker();
    }

    async pull(image: string): Promise<void> {
        const [fromImage, tag = 'latest'] = image.split(':');

        const stream = await this.#docker.createImage({
            fromImage,
            tag,
        });

        stream.pipe(process.stderr);

        return new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('end', resolve);
        });
    }

    async run(image: string, cmd: string[], { user, workingDir }: { user?: string, workingDir?: string } = {}): Promise<string> {
        const container = await this.#docker.createContainer({
            Image: image,
            Cmd: cmd,
            User: user,
            WorkingDir: workingDir,
        });

        try {
            container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
                container.modem.demuxStream(stream, process.stdout, process.stderr);
            });

            await container.start();

            const { StatusCode: code } = await container.wait();

            if (code !== 0) {
                throw new Error(`Error running command ${cmd.join(' ')}`);
            }

            return (await container.commit()).Id;
        } finally {
            await container.remove();
        }
    }

    async cpTo(image: string, archive: Readable, path: string): Promise<string> {
        const container = await this.#docker.createContainer({
            Image: image,
        });

        try {
            await container.putArchive(archive, {
                path,
            });

            return (await container.commit()).Id;
        } finally {
            await container.remove();
        }
    }

    async cpFrom(image: string, root: string, paths: string[]): Promise<Readable> {
        const container = await this.#docker.createContainer({
            Image: image,
            Cmd: ['tar', '--create', '--file', '-', ...paths],
            WorkingDir: root,
        });

        const [readable, writable] = createPair();

        container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
            container.modem.demuxStream(stream, writable, process.stderr);

            stream?.on('end', () => {
                writable.end();
            });
        });

        // TODO proper error handling

        readable.on('end', () => {
            container.remove();
        });

        await container.start();

        return readable;
    }


    async execute(config: Config, workflowName: string, root: string): Promise<void> {
        const workflow = config.workflows[workflowName];

        const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'circleci-local-'));

        let workspace: string[] = [];

        for (const name of sort(workflow.jobs)) {
            console.info(`Running job ${name}`);

            const job = config.jobs[name];

            let image = job?.docker?.[0]?.image || config.executors[job.executor].docker[0].image;

            await this.pull(image);

            for (const step of job.steps) {
                const [[type, config]]: [[string, any]] = Object.entries(step) as any;

                switch (type) {
                    case 'checkout': {
                        const path = normalizePath(config.path);

                        image = await this.run(image, ['mkdir', '--parents', path]);
                        image = await this.cpTo(image, tar.create({ cwd: root }, ['.']), path);
                        // TODO: this breaks the user of consecutive runs, fix it
                        image = await this.run(image, ['chown', '--recursive', 'circleci:circleci', path], { user: 'root' });

                        break;
                    }
                    case 'persist_to_workspace': {
                        const root = normalizePath(config.root);
                        const paths = config.paths;

                        const archive = await this.cpFrom(image, root, paths);

                        const id = uuidv4();

                        await pipe(archive, fs.createWriteStream(path.join(tmp, `${id}.tar`)));

                        workspace = [...workspace, id];

                        break;
                    }
                    case 'attach_workspace': {
                        const at = normalizePath(config.at);

                        for (const id of workspace) {
                            image = await this.cpTo(image, fs.createReadStream(path.join(tmp, `${id}.tar`)), at);
                        }
                        break;
                    }
                    case 'save_cache':
                    case 'restore_cache':
                    case 'store_artifacts':
                        // Ignore
                        break;
                    case 'run': {
                        const command: string = typeof config === 'string' ? config : config.command;
                        const workingDir = normalizePath(config.working_directory || job.working_directory || '~/project');
                        // TODO pass env variables
                        image = await this.run(image, ['bash', '-c', command], { workingDir });
                        break;
                    }
                }
            }

            // TODO cleanup images
        }

        await fs.promises.rmdir(tmp, { recursive: true });
    };
}

export default Executor;
