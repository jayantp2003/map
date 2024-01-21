import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, LoadScript } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100vh',
};

const MAP_LIBRARIES = ['places', 'visualization']

function MyComponent() {
    // const { isLoaded, loadError } = useJsApiLoader({
    //     id: 'google-map-script',
    //     googleMapsApiKey: 'AIzaSyA-YR1-sS6nUptgWbWTWgEeuzwNdmY6NSg',
    //     libraries: MAP_LIBRARIES, // Include the 'places' library
    // });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({ lat: 0, lng: 0 });
    const [curr, setCurr] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [startLocation, setStartLocation] = useState('');
    const [destinationLocation, setDestinationLocation] = useState('');
    const [gasAmount, setGasAmount] = useState('');
    const [mileage, setMileage] = useState('');
    const [fullCapacity, setFullCapacity] = useState('');
    const [formVisible, setFormVisible] = useState(true);
    const st = useRef(null);

    const toggleFormVisibility = () => {
        setFormVisible(!formVisible);
    };

    const handleInputChange = (e) => {
        setStartLocation(e.target.value);
        const autocompleteStart = new window.google.maps.places.Autocomplete(st.current);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
    };

    const LoadINFO = useCallback(async (marker) => {
        try {
            if (map === null || !window.google || !window.google.maps || !window.google.maps.places) {

                throw new Error('Google Places library is not available.');
            }

            const placesService = new window.google.maps.places.PlacesService(map);

            const request = {
                location: center,
                radius: 50,
            };

            placesService.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    const place = results[0];
                    console.log('Place:', place);

                    const photos = place.photos ? place.photos.map(photo => `<img src="${photo.getUrl({ maxWidth: 100, maxHeight: 100 })}" alt="Place Photo" />`).join('') : '';
                    const types = place.types ? place.types.join(', ') : '';

                    const infowindow = new window.google.maps.InfoWindow({
                        content: `
                      <div>
                        <h3>${place.name}</h3>
                        <p>Vicinity: ${place.vicinity}</p>
                        <p>Types: ${types}</p>
                        <p>Photos: ${photos}</p>
                      </div>
                    `,
                    });

                    marker.addListener('mouseover', () => {
                        infowindow.open(map, marker);
                    });

                    marker.addListener('mouseout', () => {
                        infowindow.close();
                    });
                }
            });
        } catch (error) {
            console.error('Error fetching place information:', error);
        }
    }, [center, map]);



    const onLoadMap = useCallback(function callback(googleMap) {
        setMap(googleMap);
        googleMap.setCenter(center);
        googleMap.setZoom(18);

        const marker = new window.google.maps.Marker({
            position: center,
            map: googleMap,
        });

        LoadINFO(marker);
        watchUserPosition();
    }, [center, LoadINFO]);

    const watchUserPosition = () => {
        const watchId = navigator.geolocation.watchPosition(
            function (position) {
                const updatedCenter = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setCenter(updatedCenter);
                console.log(updatedCenter);
            },
            function (error) {
                console.error('Error getting geolocation:', error);
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    };



    if (loadError) {
        return <div>Error loading Google Maps: {loadError.message}</div>;
    }

    return (
        <div>
            <LoadScript googleMapsApiKey='AIzaSyA-YR1-sS6nUptgWbWTWgEeuzwNdmY6NSg' >
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                    onLoad={onLoadMap}

                >
                </GoogleMap>
            </LoadScript>

            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: formVisible ? '11.5%' : '-20%', // Adjusted left property for the drawer effect
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    zIndex: 1,
                    width: "20%",
                    height: "auto",
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
                    transition: 'left 0.5s', // Added transition for the left property
                    '@media (maxWidth: 768px)': {
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        width: '80%',
                    },
                    '@media (maxWidth: 480px)': {
                        padding: '20px',
                    },
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                    }}
                    onClick={toggleFormVisibility}
                >
                </button>
                <form onSubmit={handleFormSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="start-location" style={{ display: 'block', marginBottom: '5px' }}>Start Location:</label>
                        <input
                            type="text"
                            id="start-location"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
                            placeholder="Enter start location"
                            ref={st}
                            value={startLocation}
                            onChange={(e) => handleInputChange(e)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="destination-location" style={{ display: 'block', marginBottom: '5px' }}>Destination Location:</label>
                        <input
                            type="text"
                            id="destination-location"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
                            placeholder="Enter destination location"
                            value={destinationLocation}
                            onChange={(e) => setDestinationLocation(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="gas-amount" style={{ display: 'block', marginBottom: '5px' }}>Gas Amount (in liters):</label>
                        <input
                            type="number"
                            id="gas-amount"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
                            placeholder="Enter gas amount"
                            value={gasAmount}
                            onChange={(e) => setGasAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="mileage" style={{ display: 'block', marginBottom: '5px' }}>Mileage (km/liter):</label>
                        <input
                            type="number"
                            id="mileage"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
                            placeholder="Enter mileage"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="full-capacity" style={{ display: 'block', marginBottom: '5px' }}>Full Capacity of Tank (in liters):</label>
                        <input
                            type="number"
                            id="full-capacity"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
                            placeholder="Enter tank capacity"
                            value={fullCapacity}
                            onChange={(e) => setFullCapacity(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" style={{ background: '#007bff', color: 'white', padding: '8px', borderRadius: '3px', cursor: 'pointer' }}>Search</button>
                </form>
            </div>

            <button
                style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '10px',
                    zIndex: 2,
                    background: '#007bff',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '20px',
                }}
                onClick={toggleFormVisibility}
            >

                {formVisible ? '⬅' : '➡'}
            </button>
        </div>
    );
}

export default React.memo(MyComponent);
