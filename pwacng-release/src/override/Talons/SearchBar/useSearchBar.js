import {useCallback, useRef, useState} from 'react';
import { useHistory } from 'react-router-dom';

import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useAppContext} from "@magento/peregrine/lib/context/app";

const initialValues = { search_query: '' };

export const useSearchBar = () => {
    const storage = new BrowserPersistence();
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const [valid, setValid] = useState(false);
    const [skuRedirect, setSkuRedirect] = useState({
        'searchTerm': null,
        'url': null
    });
    const {
        elementRef,
        expanded: isAutoCompleteOpen,
        setExpanded: setIsAutoCompleteOpen
    } = useDropdown();
    const history = useHistory();
    const { push } = history;
    const inputRef = useRef();

    // expand or collapse on input change
    const handleChange = useCallback(
        value => {
            const hasValue = !!value;
            const isValid = hasValue && value.length > 2;

            setValid(isValid);
            // setIsAutoCompleteOpen(hasValue);
        },
        [setValid]
    );

    // expand on focus
    const handleFocus = useCallback(() => {
        closeDrawer();
        setIsAutoCompleteOpen(true);
    }, [setIsAutoCompleteOpen]);

    // navigate on submit
    const handleSubmit = useCallback(
        ({ search_query }) => {
            if (search_query != null && search_query.trim().length > 0) {
                if (skuRedirect?.url && skuRedirect?.searchTerm && search_query === skuRedirect.searchTerm) {
                    push(`/${skuRedirect.url}`);
                } else {
                    const trimmedQuery = search_query.trim();
                    const storageSearchHistory = storage.getItem('search_history');
                    const searchHistory = storageSearchHistory ? JSON.parse(storageSearchHistory) : [];
                    const filteredHistory = searchHistory.filter(q => q !== trimmedQuery);
                    const updatedHistory = [trimmedQuery, ...filteredHistory].slice(0, 10);

                    storage.setItem('search_history', JSON.stringify(updatedHistory));

                    push(`/search.html?query=${search_query}`);
                }
                if (inputRef.current) {
                    inputRef.current.blur();
                }
                setIsAutoCompleteOpen(false);
            }
        },
        [push, skuRedirect, setIsAutoCompleteOpen]
    );

    return {
        containerRef: elementRef,
        handleChange,
        handleFocus,
        handleSubmit,
        initialValues,
        isAutoCompleteOpen,
        setIsAutoCompleteOpen,
        setValid,
        valid,
        inputRef,
        setSkuRedirect
    };
};
