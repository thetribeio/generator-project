import { Validator } from './types';

const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const validateEmail: Validator = (value) => {
    if (!regex.test(value)) {
        return 'The value is not a valid email.';
    }

    return true;
};

export default validateEmail;
