import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Layout from './components/Layout';

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route element={<Layout />}>
                <Route element={<Home />} path="/" />
            </Route>
        </Routes>
    </BrowserRouter>
);

export default App;
