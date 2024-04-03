import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import * as PLIST from 'fast-plist';
import * as XML from 'xml2js';
import YAML from 'yaml';

import helpers from 'yeoman-test';

describe('When running the generator with valid options', () => {
    let root: string;

    before(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({
                contactEmail: 'test@example.com',
                projectName: 'my-great-project',
            });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test'])
            .withPrompts({
                applicationPrefix: 'com.greatcorp',
                applicationDisplayName: 'My Great Project',
            });
    });

    after(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a readable flutter descriptor file', async () => {
        const pubspec = YAML.parse(await fs.promises.readFile(path.resolve(root, 'test', 'pubspec.yaml'), 'utf8'));
        assert.ok(pubspec);
    });

    test('It generates a flutter project with requested name', async () => {
        const pubspec = YAML.parse(await fs.promises.readFile(path.resolve(root, 'test', 'pubspec.yaml'), 'utf8'));
        assert.equal(pubspec.name, 'mygreatproject');
    });

    test('It generates an AndroidManifest with expected package name', async () => {
        const androidManifestData = await XML.parseStringPromise(await fs.promises.readFile(path.resolve(
            root,
            'test',
            'android',
            'app',
            'src',
            'main',
            'AndroidManifest.xml',
        )));

        assert.equal(androidManifestData.manifest.$.package, 'com.greatcorp.mygreatproject');
    });

    test('It generates an AndroidManifest with expected application display name', async () => {
        const androidManifestData = await XML.parseStringPromise(await fs.promises.readFile(path.resolve(
            root,
            'test',
            'android',
            'app',
            'src',
            'main',
            'AndroidManifest.xml',
        )));

        assert.equal(androidManifestData.manifest.application[0].$['android:label'], 'My Great Project');
    });

    test('It generates an Android MainActivity with expected package name', async () => {
        await fs.promises.access(
            path.join(
                root,
                'test',
                'android',
                'app',
                'src',
                'main',
                'kotlin',
                'com',
                'greatcorp',
                'mygreatproject',
                'MainActivity.kt',
            ),
            fs.constants.R_OK,
        );
    });

    test('It generates a iOS plist file with expected CFBundleDisplayName', async () => {
        const infoPlistData = PLIST.parse((await fs.promises.readFile(
            path.resolve(
                root,
                'test',
                'ios',
                'Runner',
                'Info.plist',
            ),
        )).toString('utf8'));

        assert.equal(infoPlistData.CFBundleDisplayName, 'My Great Project');
    });

    test('It adds build-&-deploy workflow to Codemagic setup with right recipient email', async () => {
        const codemagic = YAML.parse(await fs.promises.readFile(path.resolve(root, 'codemagic.yaml'), 'utf8'));

        assert.ok(codemagic.workflows['build-&-deploy']);
        assert.ok(codemagic.workflows['build-&-deploy'].publishing.email.recipients.includes('test@example.com'));
        assert.equal(codemagic.workflows['build-&-deploy'].working_directory, 'test');
    });

    test('It adds analyze-&-test workflow to Codemagic setup with right recipient email', async () => {
        const codemagic = YAML.parse(await fs.promises.readFile(path.resolve(root, 'codemagic.yaml'), 'utf8'));

        assert.ok(codemagic.workflows['analyze-&-test']);
        assert.ok(codemagic.workflows['analyze-&-test'].publishing.email.recipients.includes('test@example.com'));
        assert.equal(codemagic.workflows['analyze-&-test'].working_directory, 'test');
    });
});
