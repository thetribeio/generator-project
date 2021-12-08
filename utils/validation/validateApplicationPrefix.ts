import { Validator } from './types';

const validateApplicationPrefix: Validator = (value) => {
    if (!/^[a-z0-9\\.]+$/.test(value)) {
        return 'Application prefix can only contains lowercase letters, numbers and dots';
    }

    if (value.endsWith('.')) {
        return 'Application prefix cannot end with a dot';
    }

    return true;
};

export default validateApplicationPrefix;
