import React, {Fragment, Suspense, useEffect, useMemo, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shape, string } from 'prop-types';
import { useSearchPage } from '../../Talons/SearchPage/useSearchPage';
import ReactGA from "react-ga4";
import {gql, useQuery} from "@apollo/client";

import { useStyle } from '@magento/venia-ui/lib/classify';
import StaticBreadcrumbs from '../Breadcrumbs/staticBreadcrumbs';
import Pagination from '@magento/venia-ui/lib/components/Pagination';
import Gallery, { GalleryShimmer } from '@magento/venia-ui/lib/components/Gallery';
import defaultClasses from '@magenest/theme/BaseComponents/SearchPage/extendStyle/searchPage.module.scss';
import ProductSort, { ProductSortShimmer } from '@magento/venia-ui/lib/components/ProductSort';
import SortedByContainer, {
    SortedByContainerShimmer
} from '@magento/venia-ui/lib/components/SortedByContainer';
import Shimmer from '@magento/venia-ui/lib/components/Shimmer';
import {Meta, Title} from '@magento/venia-ui/lib/components/Head';
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";
import SearchPopular from "@magenest/theme/BaseComponents/SearchBar/searchPopular";
import CryptoJS from "crypto-js";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import SearchKeywords from "@magenest/theme/BaseComponents/SearchPage/searchKeywords";
import { FilterSidebarShimmer } from '@magento/venia-ui/lib/components/FilterSidebar';
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import {Portal} from "@magento/venia-ui/lib/components/Portal";
import { FocusScope } from 'react-aria';
import Button from "@magento/venia-ui/lib/components/Button";
const SmartSearchFilter = React.lazy(() => import('@magenest/theme/BaseComponents/SearchPage/smartSearchFilter'));

const SearchPage = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const talonProps = useSearchPage();
    const {
        data,
        error,
        loading,
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
        searchTerm,
        keywords,
        currentFilter,
        availableSortMethods,
        sortProps,
        rawKwMeta,
        isOpen,
        handleOpen,
        handleKeyDownActions,
        handleFilterApply,
        handleManualFilterApplied
    } = talonProps;
    const { isDesktop } = useMediaCheck();
    const [{ isSignedIn, currentUser }] = useUserContext();
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeCode = store?.storeInformation?.source_code?.replace('b2c_', '') || '';
    const storeName = store?.storeInformation?.name || '';
    const [searchTermTracked, setSearchTermTracked] = useState('');

    const { data: metaData, error: metaError } = useQuery(SEARCH_PAGE_META_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    useEffect(() => {
        try {
            if (data?.products?.items?.length && searchTerm !== searchTermTracked) {
                setSearchTermTracked(searchTerm);

                ReactGA.event('search', {
                    category: "Search",
                    label: "Search",
                    store_id: storeCode,
                    store_name: storeName,
                    search_term: `${searchTerm}`
                });

                if (isSignedIn && currentUser) {
                    const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || '';
                    window.web_event.track("browsing", "product_search", {
                        items: data.products.items.slice(0, 10).map(item => ({
                            "type": "product", // Fixed Value
                            "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                            "name": item.name
                        })),
                        dims: {
                            customers: {
                                "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                "name": currentUser.firstname,
                                "email": currentUser.email,
                                "phone": customerPhoneNumber
                            }
                        },
                        extra: {
                            "src_search_term": `${searchTerm}`
                        }
                    })
                } else {
                    window.web_event.track("browsing", "product_search", {
                        items: data.products.items.map(item => ({
                            "type": "product", // Fixed Value
                            "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                            "name": item.name
                        })),
                        extra: {
                            "src_search_term": `${searchTerm}`
                        }
                    })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [searchTerm, data]);

    const [viewMode, setViewMode] = useState(() => {
        return sessionStorage.getItem('viewMode') || 'grid';
    });

    const toggleViewMode = (mode) => {
        setViewMode(mode);
        sessionStorage.setItem('viewMode', mode);
    };

    const { formatMessage } = useIntl();
    const [currentSort] = sortProps;

    const metaTitle = `${searchTerm}${formatMessage({
        id: 'category.metaTitle',
        defaultMessage: ' good price, home delivery | MM Mega Market',
    })}`;

    const metaDescription = `${formatMessage({
        id: 'category.metaBuyNow',
        defaultMessage: 'Buy now',
    })} ${searchTerm} ${formatMessage({
        id: 'category.metaDescription',
        defaultMessage: 'for your family at MM Mega Market fresh, safe, carefully packaged, fast delivery nationwide. Easy ordering.',
    })}`;
    const content = useMemo(() => {
        if (!data && loading) {
            return (
                <Fragment>
                    <section className={classes.gallery}>
                        <GalleryShimmer
                            items={Array.from({ length: 12 }).fill(null)}
                        />
                    </section>
                    <section className={classes.pagination} />
                </Fragment>
            );
        }

        if (!data && error) {
            return (
                <div aria-live="polite" className={classes.noResult}>
                    <FormattedMessage
                        id={'searchPage.noResult'}
                        defaultMessage={
                            'No results found. The search term may be missing or invalid.'
                        }
                    />
                </div>
            );
        }

        if (!data) {
            return null;
        }

        if (data.products.items.length === 0) {
            return (
                <div
                    aria-live="polite"
                    className={classes.noResult}
                    data-cy="SearchPage-noResult"
                >
                    <FormattedMessage
                        id={'searchPage.noResultImportant'}
                        defaultMessage={'No results found!'}
                    />
                </div>
            );
        } else {
            return (
                <Fragment>
                    <div className={classes.viewModeAction}>
                        <button className={classes.gridMode} onClick={() => toggleViewMode('grid')}>
                            <span>
                                <FormattedMessage
                                    id={'categoryContent.gridView'}
                                    defaultMessage={'Grid View'}
                                />
                            </span>
                        </button>
                        <button className={classes.listMode} onClick={() => toggleViewMode('list')}>
                            <span>
                                <FormattedMessage
                                    id={'categoryContent.listView'}
                                    defaultMessage={'List View'}
                                />
                            </span>
                        </button>
                    </div>

                    <div className={classes.pagination+ ' ' + classes.paginationTop}>
                        <Pagination pageControl={pageControl} />
                    </div>

                    <section className={classes.gallery}>
                        <Gallery items={data.products.items} searchTerm={searchTerm.toLowerCase()} isSeo={true} />
                    </section>

                    <div className={classes.pagination+ ' ' + classes.paginationBottom}>
                        <Pagination pageControl={pageControl} />
                    </div>
                </Fragment>
            );
        }
    }, [
        classes.gallery,
        classes.noResult,
        classes.pagination,
        error,
        loading,
        data,
        pageControl
    ]);

    const productsCount =
        data && data.products && data.products.total_count
            ? data.products.total_count
            : 0;

    // If there are no products we can hide the sort button.
    const shouldShowSortButtons = productsCount && availableSortMethods;
    const shouldShowSortShimmer = !productsCount && loading;

    const maybeSortButton = shouldShowSortButtons ? (
        availableSortMethods && (
            <ProductSort
                sortProps={sortProps}
                availableSortMethods={availableSortMethods}
            />
        )
    ) : shouldShowSortShimmer ? (
        <ProductSortShimmer />
    ) : null;

    const maybeSortContainer = shouldShowSortButtons ? (
        <SortedByContainer currentSort={currentSort} />
    ) : shouldShowSortShimmer ? (
        <SortedByContainerShimmer />
    ) : null;


    const searchResultsHeading = loading ? (
        <Shimmer width={5} />
    ) : !data ? null : searchTerm ? (
        <FormattedMessage
            id={'searchPage.searchTerm'}
            values={{
                highlight: chunks => (
                    <h1 className={classes.headingHighlight}>
                        {chunks}
                        <span className={classes.extendHeading}>{' ' + formatMessage({ id: 'global.extendHeading', defaultMessage: 'good price, home delivery', })}</span>
                    </h1>
                ),
                category: searchCategory,
                term: searchTerm
            }}
            defaultMessage="Showing results for <highlight>{term}</highlight>{category, select, null {} other { in <highlight>{category}</highlight>}}"
        />
    ) : (
        <FormattedMessage
            id={'searchPage.searchTermEmpty'}
            defaultMessage={'Showing all results:'}
        />
    );

    const itemCountHeading =
        data && !loading ? (
            <span aria-live="polite" className={classes.totalPages}>
                {formatMessage(
                    {
                        id: 'searchPage.totalPages',
                        defaultMessage: '{totalCount} items'
                    },
                    { totalCount: productsCount }
                )}
            </span>
        ) : loading ? (
            <Shimmer width={5} />
        ) : null;

    if (keywords.length === 0 && productsCount === 0 && !loading) {
        return (
            <div className={classes.noResult + ' noProducts'}>
                <div className={classes.noResultWrapper}>
                    <div className={classes.noResultInner}>
                        <div className={classes.noResultText}>
                            <FormattedMessage
                                id="searchPage.noResultHtml"
                                defaultMessage={'No results found for '}
                            />
                            <strong>"{searchTerm}"</strong>
                        </div>
                    </div>
                </div>
                <CmsBlock identifiers={'suggest_product'} />
            </div>
        );
    }

    return (
        <div className={'products-display-mode-' + viewMode}>
            { keywords.length > 0 ? (
                <StaticBreadcrumbs pageTitle={
                    formatMessage(
                        {
                            id: "global.advancedSearch",
                            defaultMessage: 'Advanced Search'
                        }
                    )
                } />
            ) : (
                <StaticBreadcrumbs pageTitle={
                    formatMessage(
                        {
                            id: "searchPage.breadcrumbTitle",
                            defaultMessage: `Results for: ${searchTerm}`
                        },
                        { searchTerm: '<b>' + searchTerm + '</b>' }
                    )
                } />
            )}
            <article className={classes.root} data-cy="SearchPage-root">
                <Title>{metaData?.storeConfig?.search_page_meta_title || metaTitle}</Title>
                <Meta name="title" content={metaData?.storeConfig?.search_page_meta_title || metaTitle} />
                <Meta name="description" content={metaData?.storeConfig?.search_page_meta_description || metaDescription} />
                { metaData?.storeConfig?.search_page_meta_keywords && <Meta name="keywords" content={metaData.storeConfig.search_page_meta_keywords} /> }
                <div className={classes.searchHeader}>
                    { keywords.length > 0 ? (
                        <h1 aria-live="polite" className={classes.title}>
                            <div className={classes.searchTitle}>
                                <div>
                                    <FormattedMessage
                                        id={'global.advancedSearch'}
                                        defaultMessage={'Advanced Search'}
                                    />
                                </div>
                            </div>
                        </h1>
                    ) : (
                        <div aria-live="polite" className={classes.title}>
                            <div className={classes.searchTitle}>
                                <div>{searchResultsHeading}</div>
                            </div>
                            <div
                                aria-live="polite"
                                aria-atomic="true"
                                className={classes.searchInfo}
                            >
                                {itemCountHeading}
                            </div>
                        </div>
                    )}
                    { keywords.length > 0 ? (
                        <SearchKeywords
                            searchTerm={searchTerm}
                            keywords={keywords}
                            rawKwMeta={rawKwMeta}
                        />
                    ) : (
                        <SearchPopular classes={classes}/>
                    ) }
                </div>
                <div className={classes.contentWrapper}>
                    {isDesktop && (loading || categoryFilter?.length > 0 || brandFilter?.length > 0) && (
                        <div className={classes.sidebar}>
                            {(categoryFilter?.length > 0 || brandFilter?.length > 0) ? (
                            <Suspense fallback={<FilterSidebarShimmer />}>
                                <SmartSearchFilter
                                    categoryFilter={categoryFilter}
                                    currentCategory={currentCategory}
                                    setCurrentCategory={setCurrentCategory}
                                    brandFilter={brandFilter}
                                    currentBrand={currentBrand}
                                    setCurrentBrand={setCurrentBrand}
                                    currentPrice={currentPrice}
                                    setCurrentPrice={setCurrentPrice}
                                    handleFilterApply={handleFilterApply}
                                    handleManualFilterApplied={handleManualFilterApplied}
                                />
                            </Suspense>
                            ) : (
                                <FilterSidebarShimmer />
                            )}
                        </div>
                    )}
                    {!isDesktop && isOpen && (categoryFilter?.length > 0 || brandFilter?.length > 0) && (
                        <Portal>
                            <FocusScope contain restoreFocus autoFocus>
                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                <aside
                                    className={classes.filterDialog}
                                    onKeyDown={handleKeyDownActions}
                                    data-cy="FilterModal-root"
                                >
                                    <div className={classes.filterDialogBody}>
                                        <SmartSearchFilter
                                            categoryFilter={categoryFilter}
                                            currentCategory={currentCategory}
                                            setCurrentCategory={setCurrentCategory}
                                            brandFilter={brandFilter}
                                            currentBrand={currentBrand}
                                            setCurrentBrand={setCurrentBrand}
                                            currentPrice={currentPrice}
                                            setCurrentPrice={setCurrentPrice}
                                            handleFilterApply={handleFilterApply}
                                            handleManualFilterApplied={handleManualFilterApplied}
                                            dialog={true}
                                        />
                                    </div>
                                    <div className={classes.filterDialogFooter}>
                                        <Button onClick={() => handleFilterApply()}
                                                priority="high">
                                            <FormattedMessage
                                                id={'filterFooter.results'}
                                                defaultMessage={'See Results'}
                                            />
                                        </Button>
                                    </div>
                                </aside>
                            </FocusScope>
                        </Portal>
                    )}
                    <div className={classes.searchContent}>
                        <div className={classes.heading}>
                            <div className={classes.headerButtons}>
                                {!isDesktop && (
                                    <button className={classes.filterTrigger} onClick={handleOpen}>
                                        <FormattedMessage
                                            id={'filterModal.headerTitle'}
                                            defaultMessage={'Filters'}
                                        />
                                    </button>
                                )}
                                {maybeSortButton}
                            </div>
                        </div>
                        {content}
                    </div>
                </div>
                {metaData?.storeConfig?.search_page_description && metaData.storeConfig.search_page_description.trim() !== '' ? (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: metaData.storeConfig.search_page_description
                        }}
                    />
                ) : (
                    <></>
                )}
            </article>
        </div>
    );
};

export default SearchPage;

SearchPage.propTypes = {
    classes: shape({
        noResult: string,
        root: string,
        totalPages: string
    })
};

const SEARCH_PAGE_META_QUERY = gql`
    query getSearchPageMeta {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            search_page_meta_title
            search_page_meta_keywords
            search_page_meta_description
            search_page_description
        }
    }
`;
