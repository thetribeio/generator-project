import { AuthProvider } from 'react-admin';

const http = async (method: string, path: string, init: Omit<RequestInit, 'method'> = {}) => {
    const response = await fetch(path, {
        ...init,
        method,
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response;
};

const authProvider = (): AuthProvider => ({
    checkAuth: () => (localStorage.getItem('auth')
        ? Promise.resolve()
        : Promise.reject()),
    checkError: async () => {},
    getPermissions: async () => {},
    login: async (params) => {
        const response = await http('POST', '/api/login', {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        localStorage.setItem('auth', JSON.stringify(await response.json()));
    },
    logout: async () => {
        await http('POST', '/api/logout');

        localStorage.removeItem('auth');
    },
});

export default authProvider;
