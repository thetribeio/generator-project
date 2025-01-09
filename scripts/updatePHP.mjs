#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import execa from 'execa';
import replace from './lib/replace.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Grab composer version from Dockerfile instead of having to harcode it
const composerVersion = /https:\/\/getcomposer.org\/download\/(?<version>\d+\.\d+\.\d+)\/composer.phar/
    .exec(await readFile(resolve(root, 'generators/symfony/templates/base/docker/php/Dockerfile.ejs'))).groups.version;

const composerArgs = ['update', '--lock', '--ignore-platform-reqs', '--no-install', '--no-plugins', '--no-scripts'];
const composerDockerArgs = ['run', '--rm', '--volume', '.:/app', `composer:${composerVersion}`, ...composerArgs];

const updateComposerLock = async (cwd) => {
    await execa('docker', composerDockerArgs, { cwd });
};

const versions = await (await fetch('https://www.php.net/releases/index.php?json')).json();

const lastVersionData = Object.entries(versions)
    .sort(([keyA], [keyB]) => Math.sign(parseInt(keyA, 10) - parseInt(keyB, 10)))
    .map(([, version]) => version)
    .pop()

if (!lastVersionData) {
    throw new Error('No version found.');
}

const lastVersion = lastVersionData.version;
const lastMinor = lastVersion.split('.').slice(0, 2).join('.');

// Update CircleCI config
await replace(
    resolve(root, 'generators/symfony/templates/circleci.yaml.ejs'),
    /image: php:\d+\.\d+\.\d+/,
    `image: php:${lastVersion}`,
);

// Update Dockerfiles
for (const file of [
    'generators/symfony/templates/base/docker/php/Dockerfile.ejs',
    'generators/symfony/templates/deployment/kubernetes/docker/Dockerfile.ejs',
]) {
    await replace(
        resolve(root, file),
        /FROM php:\d+\.\d+\.\d+/,
        `FROM php:${lastVersion}`,
    );
}

// Update ansible config
await replace(
    resolve(root, 'generators/symfony/templates/deployment/ansible/package/provision.yaml.ejs'),
    /version: \d+\.\d+/,
    `version: ${lastMinor}`,
);

// Update composer platform override
for (const path of [
    'generators/symfony/templates/base/',
    'generators/symfony/templates/base-twig/',
]) {
    const updated = await replace(
        resolve(root, path, 'composer.json'),
        /"php": "\d+\.\d+\.\d+"/,
        `"php": "${lastVersion}"`,
    );

    if (updated) {
        await updateComposerLock(resolve(root, path));
    }
}

console.log(`version=${lastVersion}`);
