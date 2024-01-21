import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100vh',
};

const MAP_LIBRARIES = ['places', 'visualization']

function MyComponent() {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyA-YR1-sS6nUptgWbWTWgEeuzwNdmY6NSg',
        libraries: MAP_LIBRARIES, // Include the 'places' library
    });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({ lat: 0, lng: 0 });
    const [markers, setMarkers] = useState([]);
    // const [currentLocationMarker, setCurrentLocationMarker] = useState(null);


    const fetchPlaceDetails = useCallback(async (geometry) => {
        try {
            const geocoder = new window.google.maps.Geocoder();

            // Use reverse geocoding to get detailed information about the clicked location
            const request = {
                location: geometry,
            };

            return new Promise((resolve, reject) => {
                geocoder.geocode(request, (results, status) => {
                    if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
                        console.log('Place details:', results);
                        const placeDetails = results[0];
                        resolve(placeDetails);
                    } else {
                        reject(new Error(`Failed to fetch place details. Status: ${status}`));
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching place details:', error);
            throw error;
        }
    }, [map]);


    const displayPlaceInfo = useCallback(async (marker, loc) => {
        try {
            const results = await fetchPlaceDetails(loc);
            const place = results;

            const maxPhotosToShow = 3;
            const photos = place.photos
                ? `<div style="display: flex; flex-direction: row;">${place.photos.slice(0, maxPhotosToShow).map(photo =>
                    `<img
                        src="${photo.getUrl()}"
                        alt="Place Photo"
                        style="width: 100px; height: 100px;"
                    />`
                ).join('')}</div>`
                : '';

            const content = `
                <div>
                    ${photos}
                    <h3>${place.name}</h3>
                    <p>Address: ${place.formatted_address}</p>
                    <p>Types: ${place.types ? place.types.join(', ') : ''}</p>
                </div>
            `;

            const infowindow = new window.google.maps.InfoWindow({
                content,
            });

            infowindow.open(map, marker);
        } catch (error) {
            console.error('Error displaying place information:', error);
        }
    }, [fetchPlaceDetails, map]);


    const onLoadMap = useCallback(function callback(googleMap) {
        setMap(googleMap);
        googleMap.setCenter(center);
        googleMap.setZoom(18);

        googleMap.addListener('click', (event) => {
            const clickedLocation = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };

            // Remove the previous markers
            markers.forEach((marker) => marker.setMap(null));

            // Create a new marker for the clicked location
            const marker = new window.google.maps.Marker({
                position: clickedLocation,
                map: googleMap,
            });

            // Set the new marker as the current location marker
            // setCurrentLocationMarker(marker);

            // Store the new marker in the state
            setMarkers([marker]);

            // Display place information for the clicked location
            displayPlaceInfo(marker, clickedLocation);
        });

        // ...
    }, [center, displayPlaceInfo, markers]);

    useEffect(() => {
        const watchUserPosition = () => {
            const watchId = navigator.geolocation.watchPosition(
                function (position) {
                    const updatedCenter = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(updatedCenter);
                },
                function (error) {
                    console.error('Error getting geolocation:', error);
                }
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        };

        watchUserPosition();
    }, []);

    if (loadError) {
        return <div>Error loading Google Maps: {loadError.message}</div>;
    }

    return isLoaded ? (
        <div>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={18}
                onLoad={onLoadMap}
            ></GoogleMap>
        </div>
    ) : (
        <>
            <h1>Loading...</h1>
        </>
    );
}

export default React.memo(MyComponent);
