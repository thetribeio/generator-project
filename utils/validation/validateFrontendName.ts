import { Validator } from './types';

const validateFrontendName = (frontendNames: string[]): Validator => (value) => {
    if (value === 'backend') {
        return 'A frontend can not be named backend';
    }

    if (frontendNames.includes(value)) {
        return `There is already one frontend called "${value}"`;
    }

    if (!/^[a-z0-9-]*$/.test(value)) {
        return 'Frontend name can only contains lowercase alphanumerical characters and dashes';
    }

    if (!/^[a-z]/.test(value)) {
        return 'Frontend name must start with an alphabetical character';
    }

    return true;
};

export default validateFrontendName;
