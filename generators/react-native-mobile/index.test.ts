import fs from 'fs';
import path from 'path';
import * as PLIST from 'fast-plist';
import * as XML from 'xml2js';
import YAML from 'yaml';

import helpers from 'yeoman-test';

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
            .withArguments(['mobile'])
            .withPrompts({
                applicationPrefix: 'com.greatcorp',
                applicationDisplayName: 'My Great Project',
            });
    });

    afterAll(async () => {
        await fs.promises.rm(root, { recursive: true });
    });

    test('It generates a readable react-native package file', async () => {
        const pubspec = YAML.parse(await fs.promises.readFile(path.resolve(root, 'mobile', 'package.json'), 'utf8'));
        expect(pubspec).toBeDefined();
    });

    test('It generates a react-native project with package name', async () => {
        const pubspec = YAML.parse(await fs.promises.readFile(path.resolve(root, 'mobile', 'package.json'), 'utf8'));
        expect(pubspec.name).toEqual('mygreatproject');
    });

    test('It generates an AndroidManifest with expected package name', async () => {
        const androidManifestData = await XML.parseStringPromise(await fs.promises.readFile(path.resolve(
            root,
            'mobile',
            'android',
            'app',
            'src',
            'main',
            'AndroidManifest.xml',
        )));

        expect(androidManifestData.manifest.$.package).toEqual('com.greatcorp.mygreatproject');
    });

    test('It generates an Android MainActivity with expected package name', async () => {
        await fs.promises.access(
            path.join(
                root,
                'mobile',
                'android',
                'app',
                'src',
                'main',
                'java',
                'com',
                'greatcorp',
                'mygreatproject',
                'MainActivity.java',
            ),
            fs.constants.R_OK,
        );
    });
    test('It generates an Android MainApplication with expected package name', async () => {
        await fs.promises.access(
            path.join(
                root,
                'mobile',
                'android',
                'app',
                'src',
                'main',
                'java',
                'com',
                'greatcorp',
                'mygreatproject',
                'MainApplication.java',
            ),
            fs.constants.R_OK,
        );
    });

    test('It generates a ReactNativeFlipper file with expected package', async () => {
        await fs.promises.access(
            path.join(
                root,
                'mobile',
                'android',
                'app',
                'src',
                'debug',
                'java',
                'com',
                'greatcorp',
                'mygreatproject',
                'ReactNativeFlipper.java',
            ),
            fs.constants.R_OK,
        );
    });

    test('It generates a iOS plist file with expected CFBundleDisplayName', async () => {
        const infoPlistData = PLIST.parse((await fs.promises.readFile(
            path.resolve(
                root,
                'mobile',
                'ios',
                'mygreatproject',
                'Info.plist',
            ),
        )).toString('utf8'));

        expect(infoPlistData.CFBundleDisplayName).toEqual('mygreatproject');
    });

    test('It generates an iOS tests file with the project name', async () => {
        await fs.promises.access(
            path.join(
                root,
                'mobile',
                'ios',
                'mygreatprojectTests',
                'mygreatprojectTests.m',
            ),
            fs.constants.R_OK,
        );
    });

    test('It generates an iOS xcscheme file with the project name', async () => {
        await fs.promises.access(
            path.join(
                root,
                'mobile',
                'ios',
                'mygreatproject.xcodeproj',
                'xcshareddata',
                'xcschemes',
                'mygreatproject.xcscheme',
            ),
            fs.constants.R_OK,
        );
    });

    test('It adds react-native-android workflow to Codemagic setup with right recipient email', async () => {
        const codemagic = YAML.parse(await fs.promises.readFile(path.resolve(
            root,
            'mobile',
            'codemagic.yaml',
        ), 'utf8'));

        expect(codemagic.workflows['react-native-android']).toBeDefined();
        expect(codemagic.workflows['react-native-android'].publishing.email.recipients)
            .toContainEqual('test@example.com');
        expect(codemagic.workflows['react-native-android'].environment.vars.package)
            .toEqual('com.greatcorp.mygreatproject');
    });

    test('It adds react-native-ios workflow to Codemagic setup with right recipient email', async () => {
        const codemagic = YAML.parse(await fs.promises.readFile(path.resolve(
            root,
            'mobile',
            'codemagic.yaml',
        ), 'utf8'));

        expect(codemagic.workflows['react-native-ios']).toBeDefined();
        expect(codemagic.workflows['react-native-ios'].publishing.email.recipients).toContainEqual('test@example.com');
        expect(codemagic.workflows['react-native-ios'].environment.vars.XCODE_WORKSPACE)
            .toEqual('mygreatproject.xcworkspace');
    });
});
