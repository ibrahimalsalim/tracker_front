// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import Map from './components/Map';
import Driver from './components/Driver';

const ENDPOINT = process.env.ENDPOINT

function App() {
    const [infos, setInfos] = useState([]);

    useEffect(() => {
        const socket = io(ENDPOINT);
        socket.on('infoupdated', (info) => {
            setInfos((prevInfos) => {
                const index = prevInfos.findIndex(i => i.truckId === info.truckId);
                if (index !== -1) {
                    prevInfos[index] = info;
                } else {
                    prevInfos.push(info);
                }
                return [...prevInfos];
            });
        });

        return () => socket.disconnect();
    }, []);

    return (
        // <Router>
        //     <div>
        //         <nav>
        //             <ul>
        //                 <li><Link to="/">Home</Link></li>
        //                 <li><Link to="/driver">Driver</Link></li>
        //             </ul>
        //         </nav>
        //         <Routes>
        //             <Route path="/driver" element={<Driver />} />
        //             <Route path="/" element={
        //                 <>
        //                     <h1>Shipment Tracking</h1>
        //                     <Map infos={infos} setinfos={setInfos} />
        //                 </>
        //             } />
        //         </Routes>
        //     </div>
        // </Router>
        <>
            <Driver />
        </>
    );
}

export default App;
