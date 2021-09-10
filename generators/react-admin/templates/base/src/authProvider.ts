import { AuthProvider } from 'react-admin';

// TODO: Update auth provider to match your API authentification
const authProvider = (): AuthProvider => ({
    checkAuth: async () => {},
    checkError: async () => {},
    getPermissions: async () => {},
    login: async (params) => {
        await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
    },
    logout: async () => {
        await fetch('/api/logout', {
            method: 'POST',
        });
    },
});

export default authProvider;
