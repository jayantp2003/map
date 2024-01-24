import React from 'react';
import { useRef, useEffect } from 'react';
import { ControlPosition, Map, MapControl, Marker, InfoWindow, useMarkerRef, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

var map = null;

const MyComponent = () => {
    map = useMap();

    // useEffect(() => {
    //     if (!map) return;

    //     // do something with the map instance
    // }, [map]);

    return <>...</>;
};


const GM = () => {

    // var map = useMap('god');
    const mapref = useRef(null);

    const [markerRef, marker] = useMarkerRef();

    const handleClick = () => {
        console.log('Marker clicked');
    };

    const handleLoad = () => {

        if (mapref.current) {
            console.log('Map loaded');
            console.log(mapref.current);
            console.log(map)
            // map = mapref.current.getMap();
        } else {
            console.warn('Map not yet loaded, waiting...');
        }
    };

    const RecenterMap = () => {
        map.panTo({ lat: 0, lng: 0 });
    };

    return (
        <div ref={mapref}>

            <Map zoom={10} center={{ lat: 53.54992, lng: 10.00678 }} style={{ width: '100%', height: '100vh' }} mapId={'god'} onTilesLoaded={handleLoad} >
                <MyComponent />
                <Marker ref={markerRef} onClick={handleClick} position={{ lat: 53.54992, lng: 10.00678 }} />
                <AdvancedMarker
                    position={{ lat: 53.58675649147477, lng: 10.045572975464376 }}
                    draggable={true}></AdvancedMarker>
                <InfoWindow anchor={marker}>
                    <h2>Hello everyone!</h2>
                    <p>This is an Info Window</p>
                    {/* <img src="..." /> */}
                </InfoWindow>
                <MapControl position={ControlPosition.LEFT_CENTER}>

                    <div
                        style={{
                            // position: 'absolute',
                            // top: '50%',
                            // left: formVisible ? '11.5%' : '-20%', // Adjusted left property for the drawer effect
                            // transform: 'translate(-50%, -50%)',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '5px',
                            zIndex: 1,
                            margin: '5px',
                            // width: "20%",
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
                        // onClick={toggleFormVisibility}
                        >
                        </button>
                        <form >
                            <div style={{ marginBottom: '10px' }}>
                                <label htmlFor="start-location" style={{ display: 'block', marginBottom: '5px' }}>Start Location:</label>
                                <input
                                    type="text"
                                    id="start-location"
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ccc' }}
                                    placeholder="Enter start location"
                                    // ref={startref}
                                    // value={startLocation}
                                    // onChange={(e) => handleStartLocChange(e)}
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
                                    // ref={destinationref}
                                    // value={destinationLocation}
                                    // onChange={handleDestinationLocChange}
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
                                    // value={gasAmount}
                                    // onChange={(e) => setGasAmount(e.target.value)}
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
                                    // value={mileage}
                                    // onChange={(e) => setMileage(e.target.value)}
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
                                    // value={fullCapacity}
                                    // onChange={(e) => setFullCapacity(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" style={{ background: '#007bff', color: 'white', padding: '8px', borderRadius: '3px', cursor: 'pointer' }}>Search</button>
                        </form>
                    </div>

                    {!map && <p>Loading map...</p>}

                    {map && <button onClick={RecenterMap}>Recenter Map</button>}
                </MapControl>
            </Map>

        </div>

    )
};
export default GM;