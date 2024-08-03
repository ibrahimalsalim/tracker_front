import React, { useState, useEffect, useRef } from 'react';
import { DirectionsRenderer, GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { io } from 'socket.io-client';
import axios from "axios";

const userId = 6;
const ENDPOINT = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6MSwiaWF0IjoxNzE5NTEyMjM1fQ.Veoqx9EQ3z2jmxWLIDbNhXm_0bZXV9Ggrf483tYf2W8';
const API_TRUCK_AND_SHIPMENT = `${ENDPOINT}/api/trucks/userid/${userId}`;

const containerStyle = {
  height: '100vh',
  width: '80%',
  margin: 'auto',
};

const center = {
  lat: 34.802075,
  lng: 38.996815, // Centered on Syria
};

const bounds = {
  north: 37.0, // approximate bounds of Syria
  south: 32.0,
  west: 35.0,
  east: 42.0,
};

const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']; // Colors for the routes

function Driver() {
  const [truck, setTruck] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchTruckAndShipment = async () => {
      try {
        const response = await axios.get(API_TRUCK_AND_SHIPMENT, {
          headers: {
            token: TOKEN,
          },
        });
        setTruck(response.data);
      } catch (error) {
        console.error('Error fetching centers:', error);
      }
    };

    fetchTruckAndShipment();
  }, []);

  useEffect(() => {
    const getDirections = () => {
      if (truck && truck.shipments && truck.shipments.length > 0) {
        const shipment = truck.shipments[0];
        const directionsService = new window.google.maps.DirectionsService();

        const origin = {
          lat: parseFloat(shipment.send.latitude),
          lng: parseFloat(shipment.send.longitude),
        };
        const destination = {
          lat: parseFloat(shipment.receive.latitude),
          lng: parseFloat(shipment.receive.longitude),
        };

        directionsService.route(
          {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirectionsResponse(result);
            } else {
              console.error(`Error fetching directions: ${status}`);
            }
          }
        );
      }
    };

    if (truck) {
      getDirections();
    }
  }, [truck]);

  useEffect(() => {
    if (truck) {
      const socket = io(ENDPOINT);

      const intervalId = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const updatedTruck = {
                ...truck,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                // speed: position.coords.speed || 0,
              };
              setTruck(updatedTruck);
              socket.emit('updateLocation', updatedTruck);
            },
            (error) => {
              console.error('Error getting geolocation:', error);
            }
          );
        }
      }, 3000);

      return () => {
        clearInterval(intervalId);
        socket.disconnect();
      };
    }
  }, [truck]);

  const onLoad = (map) => {
    console.log('Map loaded:', map);
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
    <div>
      <LoadScript googleMapsApiKey="AIzaSyBlam3XfeadbdWmYpInGbJHBaPppfM0ano">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={7}
          onLoad={onLoad}
        >
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                polylineOptions: {
                  strokeColor: colors[5],
                  strokeOpacity: 0.7,
                  strokeWeight: 5,
                },

              }}
            />
          )}

          {truck && truck.latitude && truck.longitude && (
            <MarkerF
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
              // title={`Truck ${truck.id} - Shipment from ${truck.shipments[0].send_center} to ${truck.shipments[0].receive_center}`}

              title={`Truck ${truck.id}`}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Driver;
