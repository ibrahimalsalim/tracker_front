import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Driver from './components/driver/Driver';
import Admin from './components/admin/Admin';

function App() {
    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/driver">Driver</Link></li>
                        <li><Link to="/admin">Admin</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/driver" element={<Driver />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/" element={<div><h1>Home Page</h1></div>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;


