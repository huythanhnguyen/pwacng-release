import {useCallback, useEffect, useMemo, useState} from 'react';
import useFieldState from '@magento/peregrine/lib/hooks/hook-wrappers/useInformedFieldStateWrapper';
import {useLazyQuery, useQuery} from '@apollo/client';
import debounce from 'lodash.debounce';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import DEFAULT_OPERATIONS from './autoComplete.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useHistory} from "react-router-dom";

/**
 * @typedef { import("graphql").DocumentNode } DocumentNode
 */

/**
 * Returns props necessary to render an Autocomplete component.
 * @param {Object} props
 * @param {DocumentNode} props.query - GraphQL query
 * @param {Boolean} props.valid - whether to run the query
 * @param {Boolean} props.visible - whether to show the element
 */
export const useAutocomplete = props => {
    const storage = new BrowserPersistence();
    const history = useHistory();
    const { push } = history;

    const {
        valid,
        visible,
        setSkuRedirect
    } = props;

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);

    const {
        getAutocompleteResults,
        getSearchSuggestions,
        getSearchConfig,
        getCmsBlockContent
    } = operations;

    const [, { dispatch }] = useEventingContext();
    const storageSearchHistory = storage.getItem('search_history');
    const [ searchHistory, setSearchHistory ] = useState(storageSearchHistory ? JSON.parse(storageSearchHistory) : []);

    useEffect(() => {
        if (visible) {
            const storageSearchHistory = storage.getItem('search_history');
            setSearchHistory(storageSearchHistory ? JSON.parse(storageSearchHistory) : []);
        }
    }, [visible]);

    const { data: searchConfigData, loading: searchConfigLoading, error: searchConfigError } = useQuery(getSearchConfig, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });
    const { data: cmsBlockContentData, loading: cmsBlockContentLoading, error: cmsBlockContentError } = useQuery(getCmsBlockContent);
    const raw = searchConfigData?.storeConfig?.productAutocomplete || 3
    const pageSize = Number.isFinite(+raw) ? +raw : 3

    // Prepare to run the queries.
    const [runSearch, productResult] = useLazyQuery(getAutocompleteResults, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [ fetchSearchSuggestions,
        {
            data: searchSuggestionsData,
            loading: searchSuggestionsLoading,
            error: searchSuggestionsError
        } ] = useLazyQuery(getSearchSuggestions);

    // Get the search term from the field.
    const { value } = useFieldState('search_query');

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    // Create a debounced function so we only search some delay after the last
    // keypress.
    const debouncedRunQuery = useMemo(
        () =>
            debounce(async (inputText) => {
                const asmUid = getCookie('_asm_uid') || localStorage.getItem('_asm_uid') || '';

                fetchSearchSuggestions({
                    variables: {
                        q: inputText,
                        asmUid
                    }
                })
                const { data } = await runSearch({
                    variables: {
                        inputText,
                        asmUid,
                        pageSize
                    }}
                );
                if (data?.products?.is_sku_redirect && data?.products?.items?.[0]?.canonical_url) {
                    setSkuRedirect({
                        'searchTerm': inputText,
                        'url': data.products.items[0].canonical_url
                    })
                } else {
                    setSkuRedirect({
                        'searchTerm': null,
                        'url': null
                    })
                }
            }, 500),
        [runSearch, fetchSearchSuggestions, pageSize]
    );

    const searchSuggestions = useMemo(() => {
        return searchSuggestionsData?.getSearchSuggestions?.suggestions.filter(item => item.type === 'term')
    }, [searchSuggestionsData]);

    const searchCategorySuggestions = useMemo(() => {
        return searchSuggestionsData?.getSearchSuggestions?.suggestions.filter(item => item.type === 'category')
    }, [searchSuggestionsData])

    // run the query once on mount, and again whenever state changes
    useEffect(() => {
        if (valid && visible) {
            debouncedRunQuery(value);

            if (value) {
                dispatch({
                    type: 'SEARCHBAR_REQUEST',
                    payload: {
                        query: value,
                        currentPage: 1, // Same value used in GQL query
                        pageSize, // Same value used in GQL query
                        refinements: []
                    }
                });
            }
        }
        return () => debouncedRunQuery.cancel();
    }, [debouncedRunQuery, valid, value, visible, dispatch, pageSize]);

    const handleRemoveSearchHistory = useCallback((value) => {
        const updatedHistory = searchHistory.filter(item => item !== value);

        setSearchHistory(updatedHistory);
        storage.setItem('search_history', JSON.stringify(updatedHistory));
    }, [setSearchHistory, searchHistory]);

    const handleSearch = useCallback((value) => {
        if (value != null && value.trim().length > 0) {

            push(`/search.html?query=${value}`);
            // setIsAutoCompleteOpen(false);
        }
    }, [push]);

    const handleRemoveAllHistory = useCallback(() => {
        setSearchHistory([]);
        storage.removeItem('search_history');
    }, [setSearchHistory])

    const { data, error, loading } = productResult;

    // Handle results.
    const categories = data && data.products?.aggregations[1]?.options;
    const products = data && data.products;
    const filters = data && data.products.aggregations;
    const hasResult = products && products.items;
    const resultCount = products && products.total_count;
    const displayResult = valid && hasResult;
    const invalidCharacterLength = !valid && value ? true : false;
    let messageType = '';

    if (invalidCharacterLength) {
        messageType = 'INVALID_CHARACTER_LENGTH';
    } else if (error) {
        messageType = 'ERROR';
    } else if (loading) {
        messageType = 'LOADING';
    } else if (!displayResult) {
        messageType = 'PROMPT';
    } else if (!resultCount) {
        messageType = 'EMPTY_RESULT';
    } else {
        messageType = 'RESULT_SUMMARY';
    }

    return {
        categories,
        displayResult,
        filters,
        messageType,
        products,
        limit: pageSize,
        resultCount,
        value,
        searchSuggestions,
        searchHistory,
        handleRemoveSearchHistory,
        handleSearch,
        handleRemoveAllHistory,
        categoryBlock: cmsBlockContentData?.getCmsBlockContent?.categoryBlock,
        searchCategorySuggestions
    };
};
