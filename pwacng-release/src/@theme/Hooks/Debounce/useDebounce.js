import {useEffect, useState} from 'react';

const useDebounce = ( value, timer ) => {
    const [ debounceValue, setDebounceValue ] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(value);
        }, timer)

        return () => {
            clearTimeout(handler);
        }
    }, [value, timer]);

    return debounceValue;
};

export { useDebounce };
