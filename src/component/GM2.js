import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import React, { useRef } from 'react';
import './GM.css';
import { useEffect } from 'react';

// var map = null;


// const MyComponent = (props) => {
//     const map1 = useMap();
//     // props.setMap(map);
//     map = map1;
//     useEffect(() => {
//         if (!map) return;

//         // do something with the map instance
//     }, [map]);

//     return <>...</>;
// };

function GM2() {
    const position = { lat: 61.2176, lng: -149.8997 };
    const [center, setCenter] = React.useState(position);
    const [gasAmount, setGasAmount] = React.useState();
    const [mileage, setMileage] = React.useState();
    const [fullCapacity, setFullCapacity] = React.useState();
    const [formVisible, setFormVisible] = React.useState(true);
    const startref = useRef(null);
    const [startLocation, setStartLocation] = React.useState('');
    const destinationref = useRef(null);
    const [destinationLocation, setDestinationLocation] = React.useState('');
    // const directionsService = new window.google.maps.DirectionsService();
    // const directionsRenderer = new window.google.maps.DirectionsRenderer();
    const map = useMap();
    // const [map, setMap] = React.useState(null);



    const [markers, setMarkers] = React.useState([]);
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


    const getLoc = () => {
        watchUserPosition();
    };

    const toggleFormVisibility = () => {
        setFormVisible(!formVisible);
    };


    function calculateAndDisplayRoute() {
        console.log('Calculating route...');
        var start = startLocation;
        var destination = destinationLocation
        var gasAmount1 = parseFloat(gasAmount);
        var mileage1 = parseFloat(mileage);
        var fullCapacity1 = parseFloat(fullCapacity);

        var distanceStep = fullCapacity * mileage * 1000; // Convert km to meters

        var geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ 'address': start }, function (startResults, startStatus) {
            if (startStatus == window.google.maps.GeocoderStatus.OK) {
                var startLatLng = startResults[0].geometry.location;

                geocoder.geocode({ 'address': destination }, function (destResults, destStatus) {
                    if (destStatus == window.google.maps.GeocoderStatus.OK) {
                        var destinationLatLng = destResults[0].geometry.location;

                        var request = {
                            origin: startLatLng,
                            destination: destinationLatLng,
                            travelMode: 'DRIVING',
                        };

                        var directionsService = new window.google.maps.DirectionsService();
                        var directionsRenderer = new window.google.maps.DirectionsRenderer();

                        directionsService.route(request, function (response, status) {
                            if (status == 'OK') {
                                toggleFormDrawer();
                                directionsRenderer.setDirections(response);

                                var dest = window.google.maps.geometry.spherical.computeDistanceBetween(startLatLng, destinationLatLng);
                                console.log('gasAmount:', gasAmount);
                                console.log('mileage:', mileage);
                                console.log('fullCapacity:', fullCapacity);
                                var dist = gasAmount * mileage * 1000;
                                console.log('Distance between start and destination:', dest);
                                console.log('Distance to travel:', dist);

                                while (dest >= dist) {
                                    var coordinatesAtDistance = getCoordinatesAtDistance(response, dist);
                                    console.log('Coordinates at', dist / 1000, 'km along the route:', coordinatesAtDistance);

                                    var optimizedCoordinates = findClosestPointOnRoute(response, coordinatesAtDistance);
                                    console.log('Optimized Coordinates on Route:', optimizedCoordinates);

                                    findGasStationsNearby(optimizedCoordinates);
                                    dist += distanceStep;
                                }
                                console.log('Final distance:', dist);
                                recenterMap(response);
                            } else {
                                console.error('Directions request failed with status:', status);
                            }
                        });
                    } else {
                        console.error('Geocode for destination failed with status:', destStatus);
                    }
                });
            } else {
                console.error('Geocode for start location failed with status:', startStatus);
            }
        });
    }

    function getCoordinatesAtDistance(route, targetDistance) {
        var totalDistance = 0;

        for (var i = 0; i < route.routes[0].legs.length; i++) {
            var leg = route.routes[0].legs[i];

            for (var j = 0; j < leg.steps.length; j++) {
                var step = leg.steps[j];
                var stepDistance = step.distance.value;

                if (totalDistance + stepDistance >= targetDistance) {
                    var remainingDistance = targetDistance - totalDistance;
                    var ratio = remainingDistance / stepDistance;
                    return window.google.maps.geometry.spherical.interpolate(
                        step.start_location,
                        step.end_location,
                        ratio
                    );
                }
                totalDistance += stepDistance;
            }
        }

        return route.routes[0].legs[0].end_location;
    }

    function findClosestPointOnRoute(route, point) {
        var minDistance = Number.MAX_VALUE;
        var closestPoint = null;

        route.routes[0].legs.forEach(function (leg) {
            leg.steps.forEach(function (step) {
                var path = step.path;

                for (var i = 0; i < path.length; i++) {
                    var distance = window.google.maps.geometry.spherical.computeDistanceBetween(point, path[i]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoint = path[i];
                    }
                }
            });
        });

        return closestPoint;
    }

    function findGasStationsNearby(coordinates) {
        var request = {
            location: coordinates,
            radius: 15000,
            types: ['gas_station'],
        };

        var service = new window.google.maps.places.PlacesService();

        service.nearbySearch(request, function (results, status) {
            if (status == window.google.maps.places.PlacesServiceStatus.OK) {
                var closestGasStation = findClosestGasStation(results, coordinates);
                console.log('Closest Gas Station:', closestGasStation);
                setMarkers([...markers, { lat: closestGasStation.geometry.location.lat(), lng: closestGasStation.geometry.location.lng(), title: closestGasStation.name, icon: 'https://maps.google.com/mapfiles/ms/icons/gas.png' }]);
            } else {
                console.error('Places request failed with status:', status);
            }
        });
    }

    function findClosestGasStation(gasStations, referencePoint) {
        var closestGasStation = null;
        var minDistance = Number.MAX_VALUE;

        gasStations.forEach(function (gasStation) {
            var distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                referencePoint,
                gasStation.geometry.location
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestGasStation = gasStation;
            }
        });

        return closestGasStation;
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted!');
        calculateAndDisplayRoute();
    };

    const handleStartLocChange = (e) => {
        setStartLocation(e.target.value);
        const autocompleteStart = new window.google.maps.places.Autocomplete(startref.current);
        autocompleteStart.addListener('place_changed', () => {
            const place = autocompleteStart.getPlace();
            setStartLocation(place.formatted_address);
            if (!place.geometry) return;
            console.log(place.geometry.location.lat(), place.geometry.location.lng());
        });
        console.log(autocompleteStart);
    };

    const handleDestinationLocChange = (e) => {
        setDestinationLocation(e.target.value);
        const autocompleteDestination = new window.google.maps.places.Autocomplete(destinationref.current);
        autocompleteDestination.addListener('place_changed', () => {
            const place = autocompleteDestination.getPlace();
            setDestinationLocation(place.formatted_address);
            if (!place.geometry) return;
            console.log(place.geometry.location.lat(), place.geometry.location.lng());
        });
    };

    function recenterMap(response) {
        if (response && response.routes && response.routes.length > 0) {
            var bounds = new window.google.maps.LatLngBounds();

            response.routes[0].legs.forEach(function (leg) {
                leg.steps.forEach(function (step) {
                    step.path.forEach(function (point) {
                        bounds.extend(point);
                    });
                });
            });
            map.fitBounds(bounds);
            // map.fitBounds(bounds);
        } else {
            console.error('Invalid response object for recentering the map.');
        }
    }

    function toggleFormDrawer() {
        setFormVisible(!formVisible);
    }





    return (
        <div className="map-container">
            <APIProvider apiKey={'AIzaSyA-YR1-sS6nUptgWbWTWgEeuzwNdmY6NSg'} libraries={['places']} onLoad={getLoc} >
                <Map id={'mapid'} center={center} zoom={18} style={{ height: '100vh', width: '100%' }}>

                    {markers.map((marker, index) => (
                        < Marker key={index} longitude={marker.lng} latitude={marker.lat} icon={marker.icon} title={marker.title} />
                    ))}
                    <Marker position={center} />
                </Map>
            </APIProvider>

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
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="start-location" style={{ display: 'block', marginBottom: '5px' }}>Start Location:</label>
                        <input
                            type="text"
                            id="start-location"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
                            placeholder="Enter start location"
                            ref={startref}
                            value={startLocation}
                            onChange={(e) => handleStartLocChange(e)}
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
                            ref={destinationref}
                            value={destinationLocation}
                            onChange={handleDestinationLocChange}
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

export default GM2;

