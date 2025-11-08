import {useCallback, useState, useEffect, useRef} from "react";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {GET_LOCATION_USER_QUERY, GET_SUGGEST_LOCATION} from './storeLocation.gql';
import {useLazyQuery} from "@apollo/client";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useDebounce} from "../../Hooks/Debounce/useDebounce";

const UseStoreLocationPopup = props => {
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const storage = new BrowserPersistence();
    const {
        fetchStoreView
    } = props;
    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const [cityKey, setCityKey] = useState(0);
    const [wardKey, setWardKey] = useState(0);
    const [ showSuggestLocation, setShowSuggestLocation ] = useState(false);
    const [ isChangeAddress, setIsChangeAddress ] = useState(false);
    const addressFieldRef = useRef();
    const [ storeLocationValue, setStoreLocationValue ] = useState({
        address: '',
        city: '',
        ward: ''
    });
    const storeLocationAddressDebounce = useDebounce(storeLocationValue.address, 1000);

    const [ fetchLocationUser ] = useLazyQuery(GET_LOCATION_USER_QUERY);
    const [ fetchSuggestLocation,
        {
            data: suggestLocationData,
            loading: suggestLocationLoading,
            error: suggestLocationError
        }] = useLazyQuery(GET_SUGGEST_LOCATION, {
        fetchPolicy: 'cache-and-network'
    })

    const handleCurrentLocation = useCallback(async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    console.error(err.message);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, [location]);

    useEffect(async () => {
        if (location.latitude && location.longitude) {
            const result = await fetchLocationUser({
                variables: {
                    lat: location.latitude,
                    long: location.longitude,
                    language: storage.getItem('language').code,
                    website: 'b2c'
                }
            })

            if (result?.data?.locationUser) {
                setStoreLocationValue({
                    address: result.data?.locationUser?.address || '',
                    city: result.data?.locationUser?.city_code || '',
                    ward: result.data?.locationUser?.ward_code || ''
                });

                formApiRef.current.setValue('address', result.data.locationUser.address);
                formApiRef.current.setValue('city', result.data.locationUser.city);
                formApiRef.current.setValue('ward', result.data.locationUser.ward);

                setCityKey(prev => prev + 1);
                setWardKey(prev => prev + 1);
            }
        }
    }, [
        location,
        formApiRef,
        setStoreLocationValue
    ]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addressFieldRef.current && !addressFieldRef.current.contains(event.target)) {
                setShowSuggestLocation(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [addressFieldRef, setShowSuggestLocation]);

    const handleSelectSuggestLocation = useCallback((address) => {
        formApiRef.current.setValue('address', address.address);
        formApiRef.current.setValue('city', address.city);
        formApiRef.current.setValue('ward', address.ward);

        setCityKey(prev => prev + 1);
        setWardKey(prev => prev + 1);

        setStoreLocationValue({
            address: address.address,
            city: address.city_code,
            ward: address.ward_code
        });

        setIsChangeAddress(false);
        setShowSuggestLocation(false);
    }, [formApiRef, setStoreLocationValue, setShowSuggestLocation, setIsChangeAddress]);

    useEffect(async () => {
        if (isChangeAddress) {
            if (storeLocationAddressDebounce) {
                const result = await fetchSuggestLocation({
                    variables: {
                        address: storeLocationAddressDebounce
                    }
                });

                if (result?.data?.suggestLocation?.length > 0) {
                    setShowSuggestLocation(true);
                }
            }
        }
    }, [storeLocationAddressDebounce, isChangeAddress]);

    return {
        setStoreLocationValue,
        storeLocationValue,
        fetchStoreView,
        handleCurrentLocation,
        setFormApi,
        cityKey,
        wardKey,
        suggestLocation: suggestLocationData?.suggestLocation || [],
        handleSelectSuggestLocation,
        showSuggestLocation,
        setIsChangeAddress,
        setShowSuggestLocation,
        addressFieldRef
    }
}

export default UseStoreLocationPopup
