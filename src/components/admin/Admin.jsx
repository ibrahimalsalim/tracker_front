// src/components/Admin.js
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import io from 'socket.io-client';
import axios from 'axios';

const ENDPOINT = 'http://localhost:3000';
const API_CENTERS = `${ENDPOINT}/api/centers`;
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6MSwiaWF0IjoxNzE5NTEyMjM1fQ.Veoqx9EQ3z2jmxWLIDbNhXm_0bZXV9Ggrf483tYf2W8';
const containerStyle = {
  height: '100vh',
  width: '80%',
  margin: 'auto'
};

const center = {
  lat: 34.802075,
  lng: 38.996815 // Centered on Syria
};

const bounds = {
  north: 37.0, // approximate bounds of Syria
  south: 32.0,
  west: 35.0,
  east: 42.0
};

const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']; // Colors for the routes

const Admin = () => {
  const [centers, setCenters] = useState([]);
  const [directionsResponses, setDirectionsResponses] = useState([]);
  const [trucksData, setTrucksData] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await axios.get(API_CENTERS, {
          headers: {
            token: TOKEN
          }
        });
        setCenters(response.data.data);
        // console.log(response.data.data);
        

        const directionsService = new window.google.maps.DirectionsService();
        const newDirectionsResponses = [];

        // Generate routes between each pair of centers
        for (let i = 0; i < response.data.data.length; i++) {
          for (let j = i + 1; j < response.data.data.length; j++) {
            const origin = {
              lat: parseFloat(response.data.data[i].latitude),
              lng: parseFloat(response.data.data[i].longitude)
            };
            const destination = {
              lat: parseFloat(response.data.data[j].latitude),
              lng: parseFloat(response.data.data[j].longitude)
            };

            const result = new Promise((resolve, reject) => {
              directionsService.route(
                {
                  origin,
                  destination,
                  travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                  if (status === window.google.maps.DirectionsStatus.OK) {
                    resolve({ result, color: colors[(i + j) % colors.length] });
                  } else {
                    reject(`Error fetching directions ${result}`);
                  }
                }
              );
            });
            newDirectionsResponses.push(result);
          }
        }

        Promise.all(newDirectionsResponses).then(responses => {
          setDirectionsResponses(responses);
        });

      } catch (error) {
        console.error('Error fetching centers:', error);
      }
    };

    fetchCenters();
  }, []);

  useEffect(() => {
    const socket = io(ENDPOINT);
    
    socket.on('trucksData', data => {
      setTrucksData(data);
      console.log(data);
      // console.log(data);
      
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const onLoad = map => {
    mapRef.current = map;
    const strictBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(bounds.south, bounds.west),
      new window.google.maps.LatLng(bounds.north, bounds.east)
    );

    map.addListener('dragend', () => {
      if (strictBounds.contains(map.getCenter())) return;

      const c = map.getCenter();
      let x = c.lng();
      let y = c.lat();

      if (x < bounds.west) x = bounds.west;
      if (x > bounds.east) x = bounds.east;
      if (y < bounds.south) y = bounds.south;
      if (y > bounds.north) y = bounds.north;

      map.setCenter(new window.google.maps.LatLng(y, x));
    });

    map.addListener('zoom_changed', () => {
      if (map.getZoom() < 7) map.setZoom(7);
    });
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyBlam3XfeadbdWmYpInGbJHBaPppfM0ano">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        onLoad={onLoad}
      >
        {centers.map(center => (
          <Marker
            key={center.id}
            position={{ lat: parseFloat(center.latitude), lng: parseFloat(center.longitude) }}
            title={center.city}
          />
        ))}
        {directionsResponses.map(({ result, color }, index) => (
          <DirectionsRenderer
            key={index}
            directions={result}
            options={{
              polylineOptions: {
                strokeColor: color,
                strokeOpacity: 0.7,
                strokeWeight: 5,
              },
              preserveViewport: true 
            }}
          />
        ))}
        {trucksData.map((truck , index) => (
            <Marker
              key={`${truck.shipments[0].id}-${index}`}
              position={{ lat: parseFloat(truck.latitude), lng: parseFloat(truck.longitude) }}
              icon={{
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: colors[truck.id % colors.length],
                fillOpacity: 0.8,
                strokeWeight: 2,
                rotation: Math.atan2(
                  parseFloat(truck.shipments[0].receive.latitude) - parseFloat(truck.shipments[0].send.latitude),
                  parseFloat(truck.shipments[0].receive.longitude) - parseFloat(truck.shipments[0].send.longitude)
                ) * (180 / Math.PI)
              }}
              title={`Truck ${truck.id} - Shipment from ${truck.shipments[0].send_center} to ${truck.shipments[0].receive_center}`}
            />
         
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Admin;

