import React from 'react';
import { List, ListProps, Datagrid, TextField } from 'react-admin';

const UserList = (props: ListProps) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="email" />
        </Datagrid>
    </List>
);

export { UserList };
