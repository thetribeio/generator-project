#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.98.0/path/mod.ts";
import { compare } from "https://deno.land/x/semver@v1.4.0/mod.ts";

const root = dirname(dirname(fromFileUrl(import.meta.url)));

const replace = async (file: string, regexp: RegExp, replacer: string): Promise<boolean> => {
    const path = join(root, file);

    const content = await Deno.readTextFile(path);

    const newContent = content.replace(regexp, replacer);

    if (newContent === content) {
        return false;
    }

    await Deno.writeTextFile(path, newContent);

    return true;
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

const lastMajor = lastVersion.split('.').shift();

// Fetch TS config package data
const tsConfigPackage = await (await fetch(`https://registry.npmjs.com/@tsconfig/node${lastMajor}`)).json();

const tsConfigVersion = tsConfigPackage.versions[tsConfigPackage['dist-tags'].latest];

let updated = false;

// Update CircleCI config
for (const file of [
    'generators/create-react-app/templates/circleci.yaml.ejs',
    'generators/express/templates/circleci.yaml.ejs',
    'generators/next-js/templates/circleci.yaml.ejs',
    'generators/symfony/templates/circleci.yaml.ejs',
]) {
    updated = await replace(
        file,
        /image: node:\d+\.\d+\.\d+/,
        `image: node:${lastVersion}`,
    ) || updated;
}

// Update Dockerfiles
for (const file of [
    'generators/create-react-app/templates/base/docker/Dockerfile.ejs',
    'generators/create-react-app/templates/deployment/kubernetes/docker/Dockerfile.ejs',
    'generators/express/templates/base/docker/Dockerfile.ejs',
    'generators/express/templates/deployment/kubernetes/docker/Dockerfile.ejs',
    'generators/next-js/templates/base/docker/Dockerfile.ejs',
    'generators/next-js/templates/deployment/kubernetes/docker/Dockerfile.ejs',
    'generators/symfony/templates/base-twig/docker/node/Dockerfile.ejs',
    'generators/symfony/templates/deployment/kubernetes/docker/Dockerfile.ejs',
]) {
    updated = await replace(file, /FROM node:\d+\.\d+\.\d+/, `FROM node:${lastVersion}`) || updated;
}

// Update ansible config
for (const file of [
    'generators/express/templates/deployment/ansible/package/provision.yaml.ejs',
    'generators/next-js/templates/deployment/ansible/package/provision.yaml.ejs',
]) {
    updated = await replace(file, /version: \d+/, `version: ${lastMajor}`) || updated;
}

// Update tsconfig package
if (updated) {
    await replace(
        'generators/express/templates/base/package.json.ejs',
        /"@tsconfig\/node\d+": "\^\d+\.\d+\.\d+"/,
        `"@tsconfig/node${lastMajor}": "^${tsConfigVersion.version}"`,
    );

    await replace(
        'generators/express/templates/base/yarn.lock',
        /"@tsconfig\/node\d+@\^\d+\.\d+\.\d+":\n  version "\d+\.\d+\.\d+"\n  resolved "https:\/\/registry\.yarnpkg\.com\/@tsconfig\/node\d+\/-\/node\d+-\d+\.\d+\.\d+\.tgz#[0-9a-f]+"\n  integrity sha512-[A-Za-z0-9+\/=]+/,
        `"@tsconfig/node${lastMajor}@^${tsConfigVersion.version}":\n  version "${tsConfigVersion.version}"\n  resolved "https://registry.yarnpkg.com/@tsconfig/node${lastMajor}/-/node${lastMajor}-${tsConfigVersion.version}.tgz#${tsConfigVersion.dist.shasum}"\n  integrity ${tsConfigVersion.dist.integrity}`,
    );

    await replace(
        'generators/express/templates/base/tsconfig.json',
        /"extends": "@tsconfig\/node\d+\/tsconfig\.json",/,
        `"extends": "@tsconfig/node${lastMajor}/tsconfig.json",`,
    );
}

console.log(`::set-output name=version::${lastVersion}`);
