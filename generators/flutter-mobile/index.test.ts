import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as PLIST from 'fast-plist';
import * as XML from 'xml2js';
import YAML from 'yaml';

import helpers from 'yeoman-test';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('When running the generator with valid options', () => {
    let root: string;

    beforeAll(async () => {
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

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a readable flutter descriptor file', async () => {
        const pubspec = YAML.parse(await fs.promises.readFile(path.resolve(root, 'test', 'pubspec.yaml'), 'utf8'));
        expect(pubspec).toBeDefined();
    });

    test('It generates a flutter project with requested name', async () => {
        const pubspec = YAML.parse(await fs.promises.readFile(path.resolve(root, 'test', 'pubspec.yaml'), 'utf8'));
        expect(pubspec.name).toEqual('mygreatproject');
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

        expect(androidManifestData.manifest.$.package).toEqual('com.greatcorp.mygreatproject');
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

        expect(androidManifestData.manifest.application[0].$['android:label']).toEqual('My Great Project');
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

        expect(infoPlistData.CFBundleDisplayName).toEqual('My Great Project');
    });

    test('It adds build-&-deploy workflow to Codemagic setup with right recipient email', async () => {
        const codemagic = YAML.parse(await fs.promises.readFile(path.resolve(root, 'codemagic.yaml'), 'utf8'));

        expect(codemagic.workflows['build-&-deploy']).toBeDefined();
        expect(codemagic.workflows['build-&-deploy'].publishing.email.recipients).toContainEqual('test@example.com');
        expect(codemagic.workflows['build-&-deploy'].working_directory).toEqual('test');
    });

    test('It adds analyze-&-test workflow to Codemagic setup with right recipient email', async () => {
        const codemagic = YAML.parse(await fs.promises.readFile(path.resolve(root, 'codemagic.yaml'), 'utf8'));

        expect(codemagic.workflows['analyze-&-test']).toBeDefined();
        expect(codemagic.workflows['analyze-&-test'].publishing.email.recipients).toContainEqual('test@example.com');
        expect(codemagic.workflows['analyze-&-test'].working_directory).toEqual('test');
    });
});
