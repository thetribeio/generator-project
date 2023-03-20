import { Outlet } from 'react-router-dom';
import logo from '../logo.svg';
import './Layout.css';

const Layout = () => (
    <div className="Layout">
        <header className="Layout-header">
            <img alt="logo" className="Layout-logo" src={logo} />
        </header>
        <main>
            <Outlet />
        </main>
    </div>
);

export default Layout;
