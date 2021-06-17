#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.98.0/path/mod.ts";
import { compare } from "https://deno.land/x/semver@v1.4.0/mod.ts";

const root = dirname(dirname(fromFileUrl(import.meta.url)));

const replace = async (file: string, regexp: RegExp, replacer: string) => {
    const path = join(root, file);

    const content = await Deno.readTextFile(path);

    await Deno.writeTextFile(path, content.replace(regexp, replacer));
};

interface Version {
    version: string;
    lts: string|false;
}

const versions: Version[] = await (await fetch('https://nodejs.org/dist/index.json')).json();

const lastLts = versions
    .filter((version) => version.lts !== false)
    .sort((a, b) => compare(a.version, b.version))
    .pop();

if (!lastLts) {
    throw new Error('No LTS found.');
}

const lastVersion = lastLts.version.replace(/^v/, '');

// Update CircleCI config
await replace('generators/root/templates/base/.circleci/config.yml', /image: circleci\/node:\d+\.\d+\.\d+/, `image: circleci/node:${lastVersion}`);

// Update Dockerfiles
for (const file of [
    'generators/create-react-app/templates/base/docker/Dockerfile.ejs',
    'generators/express/templates/base/docker/Dockerfile.ejs',
    'generators/next-js/templates/base/docker/Dockerfile.ejs',
    'generators/symfony/templates/base-twig/docker/node/Dockerfile.ejs'
]) {
    await replace(file, /FROM node:\d+\.\d+\.\d+/, `FROM node:${lastVersion}`);
}

console.log(`::set-output name=version::${lastVersion}`);
