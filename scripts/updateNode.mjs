#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import execa from 'execa';
import { compare, major } from 'semver';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const replace = async (file, regexp, replacer) => {
    const path = resolve(root, file);

    const content = await readFile(path, 'utf8');

    const newContent = content.replace(regexp, replacer);

    if (newContent === content) {
        return false;
    }

    await writeFile(path, newContent, 'utf8');

    return true;
};

const updateYarnLock = async (path) => {
    await execa('yarn', ['install', '--ignore-platform'], { cwd: resolve(root, path) });
};

const versions = await (await fetch('https://nodejs.org/dist/index.json')).json();

const lastLts = versions
    .filter((version) => version.lts !== false)
    .sort((a, b) => compare(a.version, b.version))
    .pop();

if (!lastLts) {
    throw new Error('No LTS found.');
}

const lastVersion = lastLts.version.replace(/^v/, '');

const lastMajor = parseInt(lastVersion.split('.').shift(), 10);

// Fetch TS config package data
const tsConfigPackage = await (await fetch(`https://registry.npmjs.com/@tsconfig/node${lastMajor}`)).json();

const tsConfigVersion = tsConfigPackage.versions[tsConfigPackage['dist-tags'].latest];

// Fetch @types/node package data
const nodeTypesPackage = await (await fetch(`https://registry.npmjs.com/@types/node`)).json();
const nodeTypesVersion = Object.values(nodeTypesPackage.versions)
    .filter((version) => major(version.version) === lastMajor)
    .sort((a, b) => compare(a.version, b.version))
    .pop();

let updated = false;

// Update CircleCI config
for (const file of [
    'generators/express/templates/circleci.yaml.ejs',
    'generators/next-js/templates/circleci.yaml.ejs',
    'generators/react/templates/circleci.yaml.ejs',
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
    'generators/express/templates/base/docker/Dockerfile.ejs',
    'generators/express/templates/deployment/kubernetes/docker/Dockerfile.ejs',
    'generators/next-js/templates/base/docker/Dockerfile.ejs',
    'generators/next-js/templates/deployment/kubernetes/docker/Dockerfile.ejs',
    'generators/react/templates/base/docker/Dockerfile.ejs',
    'generators/react/templates/deployment/kubernetes/docker/Dockerfile.ejs',
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
        'generators/express/templates/base/package.json',
        /"@tsconfig\/node\d+": "\^\d+\.\d+\.\d+"/,
        `"@tsconfig/node${lastMajor}": "^${tsConfigVersion.version}"`,
    );

    await updateYarnLock('generators/express/templates/base');

    await replace(
        'generators/express/templates/base/tsconfig.json',
        /"extends": "@tsconfig\/node\d+\/tsconfig\.json",/,
        `"extends": "@tsconfig/node${lastMajor}/tsconfig.json",`,
    );
}

// Update @types/node package
if (updated) {
    for (const path of [
        'generators/express/templates/base/',
        'generators/next-js/templates/base/',
        'generators/react/templates/base/',
        'generators/react-admin/templates/base/',
    ]) {
        await replace(
            `${path}/package.json`,
            /"@types\/node": "\^\d+\.\d+\.\d+"/g,
            `"@types/node": "^${nodeTypesVersion.version}"`,
        );

        await updateYarnLock(path);
    }
}

console.log(`::set-output name=version::${lastVersion}`);
