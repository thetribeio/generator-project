#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import execa from 'execa';
import { compare, major } from 'semver';
import replace from './lib/replace.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

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
        resolve(root, file),
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
    updated = await replace(
        resolve(root, file),
        /FROM node:\d+\.\d+\.\d+/,
        `FROM node:${lastVersion}`,
    ) || updated;
}

// Update ansible config
for (const file of [
    'generators/express/templates/deployment/ansible/package/provision.yaml.ejs',
    'generators/next-js/templates/deployment/ansible/package/provision.yaml.ejs',
]) {
    updated = await replace(
        resolve(root, file),
        /version: \d+/,
        `version: ${lastMajor}`,
    ) || updated;
}

// Update tsconfig package
if (updated) {
    await replace(
        resolve(root, 'generators/express/templates/base/package.json'),
        /"@tsconfig\/node\d+": "\^\d+\.\d+\.\d+"/,
        `"@tsconfig/node${lastMajor}": "^${tsConfigVersion.version}"`,
    );

    await updateYarnLock('generators/express/templates/base');

    await replace(
        resolve(root, 'generators/express/templates/base/tsconfig.json'),
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
            resolve(root, path, 'package.json'),
            /"@types\/node": "\^\d+\.\d+\.\d+"/g,
            `"@types/node": "^${nodeTypesVersion.version}"`,
        );

        await updateYarnLock(path);
    }
}

console.log(`version=${lastVersion}`);
