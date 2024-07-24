// src/components/Map.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

function Map({ info }) {
    console.log(info);
    const bounds = [
        [32.0, 35.5], // Southwest coordinates of Syria
        [37.5, 42.0]  // Northeast coordinates of Syria
    ];

    return (
        <MapContainer
            center={[34.802075, 38.996815]}
            zoom={7}
            minZoom={7}
            // maxZoom={7} 
            // scrollWheelZoom={false} 
            style={{ height: '100vh', width: '80%', margin: 'auto' }}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[info.location.lat, info.location.lon]}>
                <Popup>
                    {`Shipment ID: ${"shipment.trackId"}, Speed: ${"shipment.speed"}, Status: ${"shipment.status"}`}
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default Map;
