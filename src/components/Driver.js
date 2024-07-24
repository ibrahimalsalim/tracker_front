// src/components/Driver.js
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Map from './Map';
const ENDPOINT = process.env.ENDPOINT;
function Driver() {
    let socket = io(ENDPOINT)

    const [info, setInfo] = useState({
        truckId: '3',
        location: { lat: 0, lon: 0 },
        speed: 0
    });


    useEffect(() => {
        let socket = io(ENDPOINT);
        const intervalId = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    // console.log(position);
                    const updatedinfo = {
                        ...info,
                        location: {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        },
                        speed: position.coords.speed || 0
                    };
                    setInfo(updatedinfo);
                    console.log("sent info" + JSON.stringify(updatedinfo));
                    socket.emit('updateinfo', updatedinfo);
                });

            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
            socket.disconnect();
        };
    });

    socket.on("infoupdated", (info) => {
        setInfo(info)
        console.log("received info" + JSON.stringify(info));
    })

    return (
        <div>
            <span className='a'>lat : {info.location.lat}</span>
            <span className='a'>lon : {info.location.lon}</span>
            <span className='a'> speed :{info.speed}</span>
            <Map info={info} />
        </div>
    );
}

export default Driver;
