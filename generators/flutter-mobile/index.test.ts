import fs from 'fs';
import path from 'path';
import * as XML from 'xml2js';
import YAML from 'yaml';

import helpers from 'yeoman-test';

describe('When running the generator with invalid options', () => {
    test('It rejects applicationPrefix with non lowercase alphanumerical characters or dots', async () => {
        await expect(
            helpers.run(__dirname)
                .withArguments(['test'])
                .withOptions({
                    applicationPrefix: 'com/greatCorp',
                    applicationName: 'mygreatproject',
                }),
        ).rejects.toThrowError('Application prefix can only contains lowercase letters, numbers and dots');
    });

    test('It rejects applicationName with non lowercase alphanumerical characters', async () => {
        await expect(
            helpers.run(__dirname)
                .withArguments(['test'])
                .withOptions({
                    applicationPrefix: 'com.greatcorp0',
                    applicationName: 'mygreatproject.',
                }),
        ).rejects.toThrowError('Application name can only contains lowercase letters and numbers');
    });
});

describe('When running the generator with valid options', () => {
    let root: string;

    beforeAll(async () => {
        const result = await helpers.run(path.resolve(__dirname, '../root'))
            .withPrompts({
                contactEmail: 'test@example.com',
            });

        root = result.cwd;

        await helpers.run(__dirname)
            .cd(root)
            .withArguments(['test'])
            .withOptions({
                applicationPrefix: 'com.greatcorp',
                applicationName: 'mygreatproject',
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

    test('It generates a flutter with requested name', async () => {
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
});
