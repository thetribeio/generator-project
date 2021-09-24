import { Validator } from './types';

const validateProjectName: Validator = (value) => {
    if (!/^[a-z1-9-]*$/.test(value)) {
        return 'Project name can only contains lowercase alphanumerical characters and dashes';
    }

    if (!/^[a-z]/.test(value)) {
        return 'Project name must start with an alphabetical character';
    }

    return true;
};

export default validateProjectName;
