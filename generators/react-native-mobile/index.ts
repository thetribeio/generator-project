import path from 'path';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';
import { validateApplicationPrefix } from '../../utils/validation';

class ReactNativeMobileGenerator extends PackageGenerator<PackageGeneratorOptions> {
    async prompting(): Promise<void> {
        await this.promptConfig([
            {
                type: 'input',
                name: 'applicationPrefix',
                message: 'Organization responsible for the project, in reverse domain name notation.',
                default: 'com.example',
                validate: validateApplicationPrefix,
            },
        ]);
    }

    writing(): void {
        const { packagePath } = this.options;
        const applicationDisplayName = this.config.get('applicationDisplayName');
        const applicationPrefix = this.config.get('applicationPrefix');
        const applicationName = this.config.get('projectName').replace(/-/g, '');
        const contactEmail = this.config.get('contactEmail');

        const templates = [{ source: 'base', destination: packagePath },
            { source: 'natif/android-debug',
                destination: path.resolve(
                    packagePath,
                    'android',
                    'app',
                    'src',
                    'debug',
                    'java',
                    ...applicationPrefix.split('.'),
                    applicationName,
                ) },
            { source: 'natif/android-main',
                destination: path.resolve(
                    packagePath,
                    'android',
                    'app',
                    'src',
                    'main',
                    'java',
                    ...applicationPrefix.split('.'),
                    applicationName,
                ) },
            { source: 'natif/ios-main', destination: path.resolve(packagePath, 'ios', applicationName) },
            { source: 'natif/ios-xcodeproj/base.xcscheme',
                destination: path.resolve(
                    packagePath,
                    'ios',
                    `${applicationName}.xcodeproj`,
                    'xcshareddata',
                    'xcschemes',
                    `${applicationName}.xcscheme`,
                ) },
            { source: 'natif/ios-xcodeproj/project.pbxproj',
                destination: path.resolve(packagePath, 'ios', `${applicationName}.xcodeproj`, 'project.pbxproj') },
            { source: 'natif/ios-tests/Info.plist',
                destination: path.resolve(packagePath, 'ios', `${applicationName}Tests`, 'Info.plist') },
            { source: 'natif/ios-tests/baseTests.m',
                destination: path.resolve(
                    packagePath,
                    'ios',
                    `${applicationName}Tests`,
                    `${applicationName}Tests.m`,
                ) }];

        templates.forEach((template) => {
            this.renderTemplate(
                template.source,
                template.destination,
                { applicationName, applicationPrefix, applicationDisplayName, contactEmail },
            );
        });
    }
}
export default ReactNativeMobileGenerator;
