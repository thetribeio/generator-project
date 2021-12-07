import path from 'path';
import PackageGenerator, { PackageGeneratorOptions } from '../../utils/PackageGenerator';

interface Options extends PackageGeneratorOptions {
    applicationPrefix: string,
    applicationName: string,
    applicationDisplayName: string,
}

class FlutterMobileGenerator extends PackageGenerator<Options> {
    initializing(): void {
        if (!/^[a-z0-9\\.]+$/.test(this.options.applicationPrefix)) {
            throw new Error('Application prefix can only contains lowercase letters, numbers and dots');
        }

        if (!/^[a-z0-9]+$/.test(this.options.applicationName)) {
            throw new Error('Application name can only contains lowercase letters and numbers');
        }
    }

    writing(): void {
        const { packagePath } = this.options;

        this.renderTemplate(
            'base',
            packagePath,
            {
                applicationName: this.options.applicationName,
                applicationPrefix: this.options.applicationPrefix,
            },
        );

        this.#moveKotlinPackageToRequestedName(
            'base/android/app/src/main/kotlin/applicationprefix/applicationname',
            path.resolve(
                packagePath,
                'android',
                'app',
                'src',
                'main',
                'kotlin',
                ...this.options.applicationPrefix.split('.'),
                this.options.applicationName,
            ),
        );
    }

    // TODO Really not great : we are rendering MainActivity twice... Any advice is welcome :)
    // I didn't achieve my goal using `this.moveDestination`
    #moveKotlinPackageToRequestedName(
        previousPath: string,
        newPath: string,
    ): void {
        this.renderTemplate(
            previousPath,
            newPath,
            {
                applicationName: this.options.applicationName,
                applicationPrefix: this.options.applicationPrefix,
            },
        );
        this.deleteDestination(
            previousPath,
        );
    }
}
export default FlutterMobileGenerator;
