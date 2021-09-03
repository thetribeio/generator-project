import simpleRestProvider from 'ra-data-simple-rest';
import React from 'react';
import { Admin, Resource } from 'react-admin';
import authProvider from './authProvider';

const App = () => (
    <Admin authProvider={authProvider()} dataProvider={simpleRestProvider('/api/')}>
        <Resource name="users" />
    </Admin>
);

export default App;
