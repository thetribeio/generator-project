import path from 'path';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';
import { validateApplicationPrefix } from '../../utils/validation';

class FlutterMobileGenerator extends PackageGenerator<PackageGeneratorOptions> {
    async prompting(): Promise<void> {
        await this.promptConfig([
            {
                type: 'input',
                name: 'applicationPrefix',
                message: 'Organization responsible for the project, in reverse domain name notation.',
                default: 'com.example',
                validate: validateApplicationPrefix,
            },
            {
                type: 'input',
                name: 'applicationDisplayName',
                message: 'Application name displayed to the user',
                default: 'My Application',
            },
        ]);
    }

    writing(): void {
        const { packagePath } = this.options;
        const applicationDisplayName = this.config.get('applicationDisplayName');
        const applicationPrefix = this.config.get('applicationPrefix');
        const applicationName = this.config.get('projectName').replaceAll('-', '');
        const contactEmail = this.config.get('contactEmail');

        this.renderTemplate(
            'base',
            packagePath,
            {
                applicationName,
                applicationPrefix,
                applicationDisplayName,
            },
        );

        this.renderTemplate(
            'android-main-activity',
            path.resolve(
                packagePath,
                'android',
                'app',
                'src',
                'main',
                'kotlin',
                ...applicationPrefix.split('.'),
                applicationName,
            ),
            {
                applicationName,
                applicationPrefix,
            },
        );

        this.configureCodemagic(
            'codemagic.yaml',
            {
                contactEmail,
            },
        );
    }
}
export default FlutterMobileGenerator;
