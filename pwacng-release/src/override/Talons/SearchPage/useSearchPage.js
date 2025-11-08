import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { useStoreSwitcher } from '@magento/peregrine/lib/talons/Header/useStoreSwitcher';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { usePagination } from '@magento/peregrine/lib/hooks/usePagination';
import { useScrollTopOnChange } from '@magento/peregrine/lib/hooks/useScrollTopOnChange';
import { getSearchParam } from '@magento/peregrine/lib/hooks/useSearchParam';
import { useSort } from '@magento/peregrine/lib/hooks/useSort';
import { getFiltersFromSearch } from '@magento/peregrine/lib/talons/FilterModal/helpers';

import DEFAULT_OPERATIONS from './searchPage.gql';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import {useUserContext} from "@magento/peregrine/lib/context/user";

const DRAWER_NAME = 'filter';
/**
 * Return props necessary to render a SearchPage component.
 *
 * @param {Object} props
 * @param {String} props.query - graphql query used for executing search
 */
export const useSearchPage = (props = {}) => {
    const [, { dispatch }] = useEventingContext();
    const [{ currentUser }] = useUserContext();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { currentStoreName } = useStoreSwitcher();
    const {
        getPageSize,
        getSearchTermData,
        getSearchAvailableSortMethods,
        productSearchQuery
    } = operations;

    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const isOpen = drawer === DRAWER_NAME;

    const { data: pageSizeData } = useQuery(getPageSize, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [getSearchTermMethod, { data: SearchTermQueryData }] = useLazyQuery(
        getSearchTermData
    );

    if (SearchTermQueryData !== undefined) {
        const [...redirectData] = [SearchTermQueryData];
        const redirectUrl = redirectData[0].searchTerm?.redirect;
        if (redirectUrl !== null) {
            window.location.replace(redirectUrl);
        }
    }

    const [getSortMethods, { data: sortData }] = useLazyQuery(
        getSearchAvailableSortMethods,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const pageSize = pageSizeData && pageSizeData.storeConfig.grid_per_page;

    const sortProps = useSort({ sortFromSearch: true });
    const [currentSort, setSort] = sortProps;
    const { sortAttribute, sortDirection } = currentSort;
    // Keep track of the sort criteria so we can tell when they change.
    const previousSort = useRef(currentSort);

    // get the URL query parameters.
    const location = useLocation();
    const { search } = location;
    // Keep track of the search terms so we can tell when they change.
    const previousSearch = useRef(search);

    // Set up pagination.
    const [paginationValues, paginationApi] = usePagination();
    const { currentPage, totalPages } = paginationValues;
    const { setCurrentPage, setTotalPages } = paginationApi;

    // retrieve app state and action creators
    const [, appApi] = useAppContext();
    const {
        actions: { setPageLoading }
    } = appApi;

    const b64urlDecode = s => {
        const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
        const b64 = s.replace(/-/g,'+').replace(/_/g,'/') + pad
        return decodeURIComponent(Array.prototype.map.call(atob(b64), c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    }

    const inputTextRaw = getSearchParam('query', location);
    const inputText = useMemo(
        () => (inputTextRaw || '').trim(),
        [inputTextRaw]
    );
    const rawKeywords = getSearchParam('keywords', location);
    const searchKeywords = rawKeywords ? rawKeywords.split(',').map(k => k.trim()).filter(Boolean) : [];

    useEffect(() => {
        setSort({
            sortText: 'Best Match',
            sortId: 'sortItem.relevance',
            sortAttribute: 'relevance',
            sortDirection: 'DESC'
        });
        setCurrentBrand([])
        setCurrentBrandFilter([])
        setCurrentPrice(null)
        setCurrentPriceFilter(null)

    }, [inputText]);

    // Filter, Sort by keywords
    const rawKwMeta = getSearchParam('kwmeta', location) || '';

    // Memo hóa map keyword -> meta từ kwmeta (base64url json)
    const metaByKeyword = useMemo(() => {
        const map = new Map();
        try {
            const arr = JSON.parse(b64urlDecode(rawKwMeta)) || [];
            if (Array.isArray(arr)) {
                arr.forEach(x => {
                    if (x?.keyword) map.set(x.keyword, x);
                });
            }
        } catch {}
        return map;
    }, [rawKwMeta]);

    // currentFilter được memo để không đổi reference nếu nội dung không đổi
    const currentFilter = useMemo(() => {
        return metaByKeyword.get(inputText)?.filter || [];
    }, [metaByKeyword, inputText]);

    const lastAppliedRef = useRef({ key: '', sig: '' });

    const catValues = currentFilter.filter(f => f?.filter_by === 'category')
        .flatMap(f => Array.isArray(f.value)
            ? f.value
            : typeof f.value === 'string'
                ? f.value.split(',').map(s => s.trim()).filter(Boolean)
                : []
        );

    const [categoryFilter, setCategoryFilter] = useState([]);
    const [currentCategoryFilter, setCurrentCategoryFilter] = useState([]);
    const [currentCategory, setCurrentCategory] = useState([]);
    const [brandFilter, setBrandFilter] = useState([]);
    const [currentBrandFilter, setCurrentBrandFilter] = useState([]);
    const [currentBrand, setCurrentBrand] = useState([]);
    const [currentPriceFilter, setCurrentPriceFilter] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(null);

    const searchCategory = useMemo(() => {
        const inputFilters = getFiltersFromSearch(search);
        if (inputFilters.size === 0) {
            return null;
        }

        const targetCategoriesSet = inputFilters.get('category_id');
        if (!targetCategoriesSet) {
            return null;
        }

        // The set looks like ["Bottoms,11", "Skirts,12"].
        // We want to return "Bottoms, Skirts", etc.
        return [...targetCategoriesSet]
            .map(categoryPair => categoryPair.split(',')[0])
            .join(', ');
    }, [search]);

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages
    };

    const [
        runQuery,
        { called: searchCalled, loading: searchLoading, error, data }
    ] = useLazyQuery(productSearchQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const asmUid = getCookie('_asm_uid') || localStorage.getItem('_asm_uid') || '';

    const isBackgroundLoading = !!data && searchLoading;

    // Update the page indicator if the GraphQL query is in flight.
    useEffect(() => {
        setPageLoading(isBackgroundLoading);
    }, [isBackgroundLoading, setPageLoading]);

    //Handle initial redirect to add page to query param to prevent double query and dispatch and further pagination
    const searched = useRef(false);
    const lastQueryVariables = useRef(null);
    const queryTimeoutRef = useRef(null);
    const manualFilterApplied = useRef(false);

    // Reset the current page back to one (1) when the search string, filters
    // or sort criteria change.
    useEffect(() => {
        // We don't want to compare page value.
        const prevSearch = new URLSearchParams(previousSearch.current);
        const nextSearch = new URLSearchParams(search);
        prevSearch.delete('page');
        nextSearch.delete('page');

        if (
            prevSearch.toString() !== nextSearch.toString() ||
            previousSort.current.sortAttribute.toString() !==
            currentSort.sortAttribute.toString() ||
            previousSort.current.sortDirection.toString() !==
            currentSort.sortDirection.toString()
        ) {
            // Clear any pending query when search changes
            if (queryTimeoutRef.current) {
                clearTimeout(queryTimeoutRef.current);
                queryTimeoutRef.current = null;
            }

            // Reset manual filter flag for new searches
            manualFilterApplied.current = false;

            // The search term changed.
            setCurrentPage(1, true);
            // And update the ref.
            previousSearch.current = search;
            previousSort.current = currentSort;
            searched.current = false;
            lastQueryVariables.current = null; // Reset query cache when search changes
        }
    }, [currentSort, search, setCurrentPage]);

    // Memoize query variables to detect duplicates
    const queryVariables = useMemo(() => {
        if (!pageSize) return null;

        // Use currentCategoryFilter for manual selections, catValues for URL-derived filters
        const uidCategories = manualFilterApplied.current
            ? (currentCategoryFilter || []).map(x => x?.value).filter(Boolean)
            : catValues;
        const filterBrands = (currentBrandFilter || []).map(x => x?.value).filter(Boolean);

        return {
            currentPage: Number(currentPage),
            filters: {
                category_uid: {in: uidCategories},
                ...(filterBrands.length ? { mm_brand: { in: filterBrands } } : {}),
                ...((currentPriceFilter?.min || currentPriceFilter?.max) ? {
                    price: {
                        ...(currentPriceFilter.min != null && { from: String(currentPriceFilter.min) }),
                        ...(currentPriceFilter.max != null && { to: String(currentPriceFilter.max) })
                    }
                } : {})
            },
            inputText,
            asmUid,
            phoneNumber: currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || '',
            pageSize: Number(pageSize),
            sort: { [sortAttribute]: sortDirection }
        };
    }, [pageSize, currentPage, catValues, currentCategoryFilter, currentBrandFilter, currentPriceFilter, inputText, asmUid, currentUser, sortAttribute, sortDirection]);

    // Check if URL-derived data is fully synchronized
    const isUrlDataSynchronized = useMemo(() => {
        // For manual filters, we don't need URL sync
        if (manualFilterApplied.current) return true;

        // Check if inputText matches the query that should have filters
        if (!inputText) return true;

        // Get the expected filters for current inputText
        const expectedFilter = metaByKeyword.get(inputText)?.filter || [];
        const expectedCatValues = expectedFilter.filter(f => f?.filter_by === 'category')
            .flatMap(f => Array.isArray(f.value)
                ? f.value
                : typeof f.value === 'string'
                    ? f.value.split(',').map(s => s.trim()).filter(Boolean)
                    : []
            );

        // Check if current catValues match expected values
        const currentCatValuesStr = JSON.stringify([...catValues].sort());
        const expectedCatValuesStr = JSON.stringify([...expectedCatValues].sort());

        return currentCatValuesStr === expectedCatValuesStr;
    }, [inputText, catValues, metaByKeyword]);

    // Helper function to compare query variables
    const areVariablesEqual = (vars1, vars2) => {
        if (!vars1 || !vars2) return false;
        try {
            return JSON.stringify(vars1) === JSON.stringify(vars2);
        } catch {
            return false;
        }
    };

    // Debounced query execution to prevent rapid successive queries
    const executeQuery = useCallback((variables) => {
        // Clear any pending query
        if (queryTimeoutRef.current) {
            clearTimeout(queryTimeoutRef.current);
        }

        // Debounce the query to allow all URL-derived state to settle
        queryTimeoutRef.current = setTimeout(() => {
            // Double-check if we still need to run this query
            if (areVariablesEqual(variables, lastQueryVariables.current)) {
                return; // Skip if variables haven't actually changed
            }

            lastQueryVariables.current = variables;
            runQuery({ variables });

            // Update UI state after query is executed to prevent race conditions
            if (!manualFilterApplied.current) {
                const filterObjects = catValues.map(value => ({value, label: ''}));
                setCurrentCategoryFilter(filterObjects);
                setCurrentCategory(filterObjects);
            }

            if (!searched.current) {
                dispatch({
                    type: 'SEARCH_REQUEST',
                    payload: {
                        query: inputText,
                        sort: {
                            attribute: sortAttribute,
                            order: sortDirection
                        },
                        pageSize: Number(pageSize),
                        currentPage: Number(currentPage)
                    }
                });
                searched.current = true;
            }
        }, 100); // 100ms debounce delay
    }, [runQuery, dispatch, inputText, sortAttribute, sortDirection, pageSize, currentPage, catValues]);

    useEffect(() => {
        // Wait until we have the type map and URL data is synchronized to fetch product data
        if (!queryVariables || !isUrlDataSynchronized) {
            return;
        }

        executeQuery(queryVariables);
    }, [queryVariables, executeQuery, isUrlDataSynchronized]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (queryTimeoutRef.current) {
                clearTimeout(queryTimeoutRef.current);
            }
        };
    }, []);

    const sanitizeCategoryOptions = options => {
        const seenValues = new Set();
        const inputOptions = Array.isArray(options) ? options : [];
        return inputOptions.filter(option => {
            const labelText = option?.label?.toString().trim();
            const valueText = option?.value?.toString().trim();
            if (!labelText || !valueText) return false;
            if (seenValues.has(valueText)) return false;
            seenValues.add(valueText);
            return true;
        });
    };
    const sanitizeBrandOptions = options => {
        const seenValues = new Set();
        const inputOptions = Array.isArray(options) ? options : [];
        return inputOptions.filter(option => {
            const labelText = option?.label?.toString().trim();
            const valueText = option?.value?.toString().trim();
            if (!labelText || !valueText) return false;
            if (seenValues.has(valueText)) return false;
            seenValues.add(valueText);
            return true;
        });
    };

    useEffect(() => {
        if (data?.products) {
            // category filter
            const smartSearchAggregation = data.products.cdp_filter?.find(
                aggregation => aggregation.attribute_code === 'category_uid'
            );
            const defaultAggregation = data.products.aggregations?.find(
                aggregation => aggregation.attribute_code === 'category_uid'
            );
            const smartSearchOptions = smartSearchAggregation?.options || [];
            const defaultOptions = defaultAggregation?.options || [];
            const sourceOptions =
                data.products.is_use_smart_search && smartSearchOptions.length > 0
                    ? smartSearchOptions
                    : defaultOptions;
            setCategoryFilter(sanitizeCategoryOptions(sourceOptions));

            // brand filter
            const smartSearchBrandAggregation = data.products.cdp_filter?.find(
                aggregation => aggregation.attribute_code === 'mm_brand'
            );
            const defaultBrandAggregation = data.products.aggregations?.find(
                aggregation => aggregation.attribute_code === 'mm_brand'
            );
            const smartSearchBrandOptions = smartSearchBrandAggregation?.options || [];
            const defaultBrandOptions = defaultBrandAggregation?.options || [];
            const sourceBrandOptions =
                data.products.is_use_smart_search && smartSearchBrandOptions.length > 0
                    ? smartSearchBrandOptions
                    : defaultBrandOptions;
            setBrandFilter(sanitizeCategoryOptions(sourceBrandOptions));
        } else {
            setCategoryFilter([]);
            setBrandFilter([]);
        }
    }, [data]);

    useEffect(() => {
        if (!categoryFilter.length || !catValues.length) return;
        if (lastAppliedRef.current.key !== (inputText || '')) return;

        // Only update if we need to add labels to existing filters
        const selected = categoryFilter.filter(opt => catValues.includes(opt.value));
        const currentValues = currentCategoryFilter.map(f => f.value).join(',');
        const selectedValues = selected.map(o => o.value).join(',');

        // Only update if the values are different (to add proper labels)
        if (selectedValues === currentValues) {
            // Values are the same, just update with proper labels if needed
            const hasLabels = currentCategoryFilter.every(f => f.label && f.label.trim());
            if (!hasLabels && selected.length > 0) {
                setCurrentCategoryFilter(selected);
                setCurrentCategory(selected);
            }
            return;
        }

        // Values are different, update normally
        setCurrentCategoryFilter(selected);
        setCurrentCategory(selected);
        lastAppliedRef.current.sig = selectedValues;
    }, [categoryFilter, catValues, inputText, currentCategoryFilter]);

    const handleOpen = useCallback(() => {
        setCurrentCategory(currentCategoryFilter)
        setCurrentBrand(currentBrandFilter)
        setCurrentPrice(currentPriceFilter)
        toggleDrawer(DRAWER_NAME);
    }, [toggleDrawer, currentCategoryFilter, currentBrandFilter, currentPriceFilter]);

    const handleClose = useCallback(() => {
        closeDrawer();
    }, [closeDrawer]);

    const handleFilterApply = useCallback(
        (cate = currentCategory, brands = currentBrand || [], price = currentPrice || null) => {
            setCurrentPage(1, true);
            setCurrentCategoryFilter(cate);
            setCurrentBrandFilter(brands);
            setCurrentPriceFilter(price);
            closeDrawer();

            // Set flag to indicate manual filter application
            manualFilterApplied.current = true;

            // Execute query with new filters immediately
            const uidCategories = (cate || []).map(x => x?.value).filter(Boolean);
            const filterBrands = (brands || []).map(x => x?.value).filter(Boolean);

            const newQueryVariables = {
                currentPage: 1, // Reset to page 1 when filters change
                filters: {
                    category_uid: {in: uidCategories},
                    ...(filterBrands.length ? { mm_brand: { in: filterBrands } } : {}),
                    ...((price?.min || price?.max) ? {
                        price: {
                            ...(price.min != null && { from: String(price.min) }),
                            ...(price.max != null && { to: String(price.max) })
                        }
                    } : {})
                },
                inputText,
                asmUid,
                phoneNumber: currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || '',
                pageSize: Number(pageSize),
                sort: { [sortAttribute]: sortDirection }
            };

            // Clear any pending timeout and execute immediately
            if (queryTimeoutRef.current) {
                clearTimeout(queryTimeoutRef.current);
                queryTimeoutRef.current = null;
            }

            lastQueryVariables.current = newQueryVariables;
            runQuery({ variables: newQueryVariables });
        },
        [currentCategory, currentBrand, currentPrice, closeDrawer, setCurrentPage, inputText, asmUid, currentUser, pageSize, sortAttribute, sortDirection, runQuery, queryTimeoutRef]
    );

    const handleManualFilterApplied = () => {
        manualFilterApplied.current = true;
    };

    const handleKeyDownActions = useCallback(
        event => {
            // do not handle keyboard actions when the modal is closed
            if (!isOpen) {
                return;
            }

            switch (event.keyCode) {
                // when "Esc" key fired -> close the modal
                case 27:
                    handleClose();
                    break;
            }
        },
        [isOpen, handleClose]
    );

    // Set the total number of pages whenever the data changes.
    useEffect(() => {
        const totalPagesFromData = data?.products?.page_info?.total_pages || null;

        setTotalPages(totalPagesFromData);

        return () => {
            setTotalPages(null);
        };
    }, [data, setTotalPages]);

    useEffect(() => {
        if (inputText) {
            getSearchTermMethod({
                variables: {
                    search: inputText
                }
            });
        }
    }, [inputText, getSearchTermMethod]);

    useEffect(() => {
        if (inputText) {
            getSortMethods({
                variables: {
                    search: inputText
                }
            });
        }
    }, [inputText, getSortMethods]);

    // Avoid showing a "empty data" state between introspection and search.
    const loading = !searchCalled || searchLoading;

    useScrollTopOnChange(currentPage);

    const availableSortMethods = sortData
        ? sortData.products.sort_fields?.options
        : null;

    return {
        data,
        error,
        loading,
        pageSize,
        pageControl,
        categoryFilter,
        currentCategory,
        setCurrentCategory,
        brandFilter,
        currentBrand,
        setCurrentBrand,
        currentPrice,
        setCurrentPrice,
        searchCategory,
        searchTerm: inputText,
        keywords: searchKeywords,
        availableSortMethods,
        sortProps,
        currentSort,
        currentFilter,
        rawKwMeta,
        currentStoreName,
        isOpen,
        handleOpen,
        handleKeyDownActions,
        handleFilterApply,
        handleManualFilterApplied
    };
};
