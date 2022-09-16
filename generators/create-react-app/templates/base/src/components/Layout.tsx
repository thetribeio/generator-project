import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../logo.svg';
import './Layout.css';

const Layout = () => (
    <div className="App">
        <header className="App-header">
            <img alt="logo" className="App-logo" src={logo} />
        </header>
        <main>
            <Outlet />
        </main>
    </div>
);

export default Layout;
