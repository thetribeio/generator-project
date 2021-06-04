import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

const App = () => (
    <Router>
        <div className="App">
            <header className="App-header">
                <img alt="logo" className="App-logo" src={logo} />
            </header>
            <main>
                <Switch>
                    <Route path="/" exact>
                        <p>
                            Edit <code>src/App.tsx</code> and save to reload.
                        </p>
                        <a
                            className="App-link"
                            href="https://reactjs.org"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Learn React
                        </a>
                    </Route>
                </Switch>
            </main>
        </div>
    </Router>
);

export default App;
