import { Validator } from './types';

/**
 * Validate a package path so that it can't break out of the current projet and is cannonical.
 */
const validatePackagePath: Validator = (value) => {
    if (value.includes('\0')) {
        return 'Path can\'t contain null bytes';
    }

    const start = value.substr(0, 1);

    if (start === '/') {
        return 'Path can\'t be absolute';
    }

    if (start === '~') {
        return 'Path can\'t start with ~';
    }

    const segments = value.split('/');

    for (const segment of segments) {
        if (segment === '..') {
            return 'Path can\'t contain parent directory segment';
        }

        if (segment === '.') {
            return 'Path can\'t contain current directory segment';
        }
    }

    return true;
};

export default validatePackagePath;
