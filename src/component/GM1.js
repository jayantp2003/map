import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const GM1 = () => {
    const [center, setCenter] = useState({ lat: 22.572645, lng: 88.363892 });
    const [curr, setCurr] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [startLocation, setStartLocation] = useState('');
    const [destinationLocation, setDestinationLocation] = useState('');
    const [gasAmount, setGasAmount] = useState('');
    const [mileage, setMileage] = useState('');
    const [fullCapacity, setFullCapacity] = useState('');
    const [formVisible, setFormVisible] = useState(true);
    const [map, setMap] = useState(null);
    const st = useRef(null);

    const mapStyles = {
        height: "100vh",
        width: "100%"
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
    };

    const onLoadMap = useCallback(function callback(googleMap) {
        setMap(googleMap);
        googleMap.setCenter(center);
        googleMap.setZoom(18);

        googleMap.addListener('click', (event) => {
            // event.preventDefault();
            const clickedLocation = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };

            // Remove the previous markers
            markers.forEach((marker) => marker.setMap(null));

            console.log(markers);

            // Create a new marker for the clicked location
            const marker = new window.google.maps.Marker({
                position: clickedLocation,
                map: googleMap,
            });

            console.log(marker);

            // Set the new marker as the current location marker
            setMarkers([marker]);

            console.log(markers)

            // Display place information for the clicked location
            setCurr(clickedLocation);
        });

        // const autocompleteStart = new window.google.maps.places.Autocomplete(startLocation);
        // const autocompleteDestination = new window.google.maps.places.Autocomplete(destinationLocation);

    }, [center, markers]);

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

    // const handleScriptLoad = () => {
    //     const autocompleteStart = new window.google.maps.places.Autocomplete(startLocation);
    //     const autocompleteDestination = new window.google.maps.places.Autocomplete(destinationLocation);
    // };

    const toggleFormVisibility = () => {
        setFormVisible(!formVisible);
    };

    const handleInputChange = (e) => {
        setStartLocation(e.target.value);
        const autocompleteStart = new window.google.maps.places.Autocomplete(st.current);
    };

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            <LoadScript googleMapsApiKey='AIzaSyA-YR1-sS6nUptgWbWTWgEeuzwNdmY6NSg' >
                <GoogleMap
                    mapContainerStyle={mapStyles}
                    center={center}
                    zoom={10}
                    onLoad={onLoadMap}

                >
                    {markers.map((marker, index) => (
                        <Marker key={index} position={{ lat: marker.position.lat(), lng: marker.position.lng() }} />
                    ))}
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

export default GM1;
