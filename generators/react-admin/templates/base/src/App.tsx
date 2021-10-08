import simpleRestProvider from 'ra-data-simple-rest';
import React from 'react';
import { Admin, Resource } from 'react-admin';
import { UserList } from './admin/user';
import authProvider from './authProvider';

const App = () => (
    <Admin authProvider={authProvider()} dataProvider={simpleRestProvider('/api/')}>
        <Resource list={UserList} name="users" />
    </Admin>
);

export default App;
