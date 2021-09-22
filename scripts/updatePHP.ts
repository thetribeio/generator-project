#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write
import replace from './lib/replace.ts';

interface Version {
    version: string;
}

const versions: Version[] = await (await fetch('https://www.php.net/releases/index.php?json')).json();

const lastVersionData = Object.entries(versions)
    .sort(([keyA], [keyB]) => Math.sign(parseInt(keyA, 10) - parseInt(keyB, 10)))
    .map(([, version]) => version)
    .pop()

if (!lastVersionData) {
    throw new Error('No version found.');
}

const lastVersion = lastVersionData.version;;

// Update CircleCI configs
for (const file of [
    'generators/root/templates/base/.circleci/config.yml',
    'generators/symfony/templates/circleci.yaml.ejs',
]) {
    await replace(file, /image: circleci\/php:\d+\.\d+\.\d+/, `image: circleci/php:${lastVersion}`);
}

// Update Dockerfile
await replace('generators/symfony/templates/base/docker/php/Dockerfile.ejs', /FROM php:\d+\.\d+\.\d+/, `FROM php:${lastVersion}`);

// Update composer platform override
for (const file of [
    'generators/symfony/templates/base/composer.json',
    'generators/symfony/templates/base-twig/composer.json',
]) {
    await replace(file, /"php": "\d+\.\d+\.\d+"/, `"php": "${lastVersion}"`);
}

console.log(`::set-output name=version::${lastVersion}`);
