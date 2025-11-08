import React, {useState, useEffect} from 'react';
import defaultClasses from './storeMap.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import ReactMapGL, { Source, Layer, Marker, Popup } from '@goongmaps/goong-map-react';
import {FormattedMessage} from "react-intl";

const geojson = {
    type: 'FeatureCollection',
    features: [
        {type: 'Feature', geometry: {type: 'Point', coordinates: [-122.4, 37.8]}}
    ]
};

const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
        'circle-radius': 10,
        'circle-color': '#007cbf'
    }
};

const StoreMap = props => {
    const {
        classes: propClasses,
        stores,
        storeCurrent,
        setStoreCurrent
    } = props
    const classes = useStyle(defaultClasses, propClasses);

    const [viewport, setViewport] = React.useState({
        longitude: 106,
        latitude: 16,
        zoom: 4.6
    });

    // const coordinates = stores.filter(store => store.latitude !== null && store.longitude !== null);
    const coordinates = [];
    const seenCoordinates = new Set();

    stores.forEach(store => {
        const { latitude, longitude } = store;

        if (latitude === null || longitude === null) return;

        const coordinateKey = `${latitude},${longitude}`;

        if (!seenCoordinates.has(coordinateKey)) {
            coordinates.push(store);
            seenCoordinates.add(coordinateKey);
        }
    });

    useEffect(() => {
        if (storeCurrent && storeCurrent.latitude && storeCurrent.longitude) {
            setViewport({
                longitude: parseFloat(storeCurrent.longitude),
                latitude: parseFloat(storeCurrent.latitude),
                zoom: 12
            })
        }
    }, [storeCurrent, setStoreCurrent]);

    return (
        <div className={classes.storeMap}>
            <ReactMapGL
                width="100%" height="100%"
                {...viewport}
                onViewportChange={setViewport}
                goongApiAccessToken={GOONG_KEY}
            >
                <Source id="my-data" type="geojson" data={geojson}>
                    <Layer {...layerStyle} />
                </Source>
                {
                    coordinates.map((coord, index) => (
                        <Marker
                            key={index}
                            latitude={parseFloat(coord.latitude)}
                            longitude={parseFloat(coord.longitude)}
                            onClick={() => setStoreCurrent(coord)}
                        >
                            <div className={classes.storeMarker} style={{ width: '27px', height: '41px' }} />
                        </Marker>
                    ))
                }
                {
                    storeCurrent && (
                        <Popup
                            latitude={parseFloat(storeCurrent.latitude)}
                            longitude={parseFloat(storeCurrent.longitude)}
                            onClose={() => setStoreCurrent(null)}
                            closeOnClick={false}
                        >
                            <div className={classes.currentStoreInfo}>
                                <h3>{storeCurrent.name}</h3>
                                <p>{storeCurrent.street}</p>
                                <p>
                                    <a href={`https://www.google.com/maps/dir//${storeCurrent.latitude},${storeCurrent.longitude}`} target="_blank" rel="noopener noreferrer">
                                        <FormattedMessage
                                            id={'global.directions'}
                                            defaultMessage={'Directions'}
                                        />
                                    </a>
                                </p>
                            </div>
                        </Popup>
                    )
                }
            </ReactMapGL>
        </div>
    )
}

export default StoreMap;
