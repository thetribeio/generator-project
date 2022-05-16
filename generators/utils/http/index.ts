import { GeneratorOptions } from 'yeoman-generator';
import BaseGenerator from '../../../utils/BaseGenerator';
import { DeploymentChoice } from '../../root';

interface HttpUtilGeneratorOptions extends GeneratorOptions {
    httpPath: string;
    packageName: string;
}

/**
 * Utility generator to factorize logic for generators that are exposed via HTTP.
 */
class HttpUtilGenerator extends BaseGenerator<HttpUtilGeneratorOptions> {
    constructor(args: string | string[], opts: HttpUtilGeneratorOptions) {
        super(args, opts);

        this.argument('packageName', { type: String, required: true });
        this.argument('httpPath', { type: String, required: true });
        this.argument('port', { type: Number, required: true });
    }

    writing(): void {
        switch (this.config.get('deployment')) {
            case DeploymentChoice.Ansible:
                this.#writeAnsibleDeployment();
                break;
            case DeploymentChoice.Kubernetes:
                this.#writeKubernetesDeployment();
                break;
        }
    }

    #writeAnsibleDeployment() {
    }

    #writeKubernetesDeployment(): void {
        const { httpPath, packageName, port } = this.options;

        this.renderTemplate(
            'deployment/kubernetes/chart/ingress.yaml.ejs',
            `modules/deployment/chart/templates/${packageName}-ingress.yaml`,
            { httpPath, packageName },
        );

        this.renderTemplate(
            'deployment/kubernetes/chart/service.yaml.ejs',
            `modules/deployment/chart/templates/${packageName}-service.yaml`,
            { packageName, port },
        );
    }
}

export default HttpUtilGenerator;
