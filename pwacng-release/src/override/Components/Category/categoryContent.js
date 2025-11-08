import React, { Fragment, Suspense, useMemo, useRef, useState, useEffect } from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import { array, number, shape, string } from 'prop-types';

import { useIsInViewport } from '@magento/peregrine/lib/hooks/useIsInViewport';
import { useCategoryContent } from '@magento/peregrine/lib/talons/RootComponents/Category';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Breadcrumbs from '@magento/venia-ui/lib/components/Breadcrumbs';
import FilterModalOpenButton, {
    FilterModalOpenButtonShimmer
} from '@magento/venia-ui/lib/components/FilterModalOpenButton';
import { FilterSidebarShimmer } from '@magento/venia-ui/lib/components/FilterSidebar';
import Gallery, { GalleryShimmer } from '@magento/venia-ui/lib/components/Gallery';
import Pagination from '@magento/venia-ui/lib/components/Pagination';
import ProductSort, { ProductSortShimmer } from '@magento/venia-ui/lib/components/ProductSort';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import Shimmer from '@magento/venia-ui/lib/components/Shimmer';
import SortedByContainer, {
    SortedByContainerShimmer
} from '@magento/venia-ui/lib/components/SortedByContainer';
import defaultClasses from '@magenest/theme/BaseComponents/Category/extendStyle/category.module.scss';
import NoProductsFound from './NoProductsFound/noProductsFound';
import SuggestCategory from './suggestCategory';

const FilterModal = React.lazy(() => import('@magento/venia-ui/lib/components/FilterModal'));
const FilterSidebar = React.lazy(() =>
    import('@magento/venia-ui/lib/components/FilterSidebar')
);
import ReactGA from "react-ga4";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {Meta, Title} from "../Head";
import CmsBlock from "../CmsBlock/cmsBlock";

const CategoryContent = props => {
    const {
        categoryId,
        data,
        isLoading,
        pageControl,
        sortProps,
        pageSize
    } = props;
    const [currentSort] = sortProps;
    const storage = new BrowserPersistence();
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';
    const { formatMessage } = useIntl();

    const talonProps = useCategoryContent({
        categoryId,
        data,
        pageSize
    });

    const {
        availableSortMethods,
        categoryName,
        categoryImage,
        categoryDescription,
        filters,
        items,
        totalCount,
        totalPagesFromData
    } = talonProps;

    const [viewMode, setViewMode] = useState(() => {
        return sessionStorage.getItem('viewMode') || 'grid';
    });
    const toggleViewMode = (mode) => {
        setViewMode(mode);
        sessionStorage.setItem('viewMode', mode);
    };

    const sidebarRef = useRef(null);
    const classes = useStyle(defaultClasses, props.classes);
    const shouldRenderSidebarContent = useIsInViewport({
        elementRef: sidebarRef
    });

    const shouldShowFilterButtons = filters && filters.length;
    const shouldShowFilterShimmer = filters === null && isLoading;

    // If there are no products we can hide the sort button.
    const shouldShowSortButtons = totalPagesFromData && availableSortMethods;
    const shouldShowSortShimmer = !totalPagesFromData && isLoading;

    const maybeFilterButtons = shouldShowFilterButtons ? (
        <FilterModalOpenButton filters={filters} />
    ) : shouldShowFilterShimmer ? (
        <FilterModalOpenButtonShimmer />
    ) : null;

    const filtersModal = shouldShowFilterButtons ? (
        <FilterModal filters={filters} />
    ) : null;

    const sidebar = shouldShowFilterButtons ? (
        <FilterSidebar filters={filters} />
    ) : shouldShowFilterShimmer ? (
        <FilterSidebarShimmer />
    ) : null;

    const maybeSortButton = shouldShowSortButtons ? (
        <ProductSort
            sortProps={sortProps}
            availableSortMethods={availableSortMethods}
        />
    ) : shouldShowSortShimmer ? (
        <ProductSortShimmer />
    ) : null;

    const maybeSortContainer = shouldShowSortButtons ? (
        <SortedByContainer currentSort={currentSort} />
    ) : shouldShowSortShimmer ? (
        <SortedByContainerShimmer />
    ) : null;

    const categoryResultsHeading =
        totalCount > 0 ? (
            <div>
                {' '}
                <FormattedMessage
                    id={'global.resultCount'}
                    values={{
                        count: totalCount
                    }}
                    defaultMessage={'{count} Results'}
                />{' '}
            </div>
        ) : isLoading ? (
            <Shimmer width={5} />
        ) : null;

    const categoryDescriptionElement = categoryDescription ? (
        <div className={classes.categoryDescriptionWrapper}>
            <RichContent html={categoryDescription} />
        </div>
    ) : null;

    const categoryImageElement = categoryImage ? (
        <div className={classes.categoryImageWrapper}>
            <img src={categoryImage} alt={categoryName} />
        </div>
    ) : null;

    const content = useMemo(() => {
        if (!totalPagesFromData && !isLoading && categoryId) {
            return <NoProductsFound categoryId={categoryId} />;
        }

        const gallery = totalPagesFromData ? (
            <Gallery items={items} isSeo={true} />
        ) : (
            <GalleryShimmer items={items} />
        );

        const pagination = totalPagesFromData ? (
            <Pagination pageControl={pageControl} />
        ) : null;

        return (
            <Fragment>
                <div className={classes.viewModeAction}>
                    <button className={classes.gridMode} aria-label="Grid View" onClick={() => toggleViewMode('grid')}>
                        <span>
                            <FormattedMessage
                                id={'categoryContent.gridView'}
                                defaultMessage={'Grid View'}
                            />
                        </span>
                    </button>
                    <button className={classes.listMode} aria-label="List View" onClick={() => toggleViewMode('list')}>
                        <span>
                            <FormattedMessage
                                id={'categoryContent.listView'}
                                defaultMessage={'List View'}
                            />
                        </span>
                    </button>
                </div>
                <div className={classes.pagination+ ' ' + classes.paginationTop}>{pagination}</div>
                <section className={classes.gallery}>{gallery}</section>
                <div className={classes.pagination + ' ' + classes.paginationBottom}>{pagination}</div>
            </Fragment>
        );
    }, [
        categoryId,
        classes.gallery,
        classes.pagination,
        isLoading,
        items,
        pageControl,
        totalPagesFromData
    ]);

    const categoryTitle = categoryName ? categoryName : <Shimmer width={5} />;
    const cateId = data?.categories?.items?.[0]?.id || null;

    useEffect(() => {
        const allNull = items.every(item => item === null);
        if (items.length > 0 && !allNull) {
            ReactGA.event('view_item_list', {
                category: 'Ecommerce',
                label: 'Product List Page',
                store_id: storeCode,
                store_name: storeName,
                items: items.map(product => ({
                    item_id: `${product?.art_no}_${storeCode}`,
                    item_name: product?.name,
                    item_category: categoryName,
                    price: product?.price_range.maximum_price.final_price.value
                }))
            });
        }
    }, [items, categoryName]);

    const metaTitle = `${categoryName}${formatMessage({
        id: 'category.metaTitleCapitalize',
        defaultMessage: ' Good price, Home delivery | MM Mega Market',
    })}`;

    const metaDescription = `${formatMessage({
        id: 'category.metaBuyNow',
        defaultMessage: 'Buy now',
    })} ${categoryName} ${formatMessage({
        id: 'category.metaDescription',
        defaultMessage: 'for your family at MM Mega Market fresh, safe, carefully packaged, fast delivery nationwide. Easy ordering.',
    })}`;

    return (
        <Fragment>
            <Title>{metaTitle}</Title>
            <Meta name="title" content={metaTitle} />
            <Meta name="description" content={metaDescription} />
            <Meta property="og:image" content={'https://online.mmvietnam.com/static/icons/icon-og.png'} />
            <Meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
            <Meta property="og:type" content={'website'} />
            <div className={'products-display-mode-' + viewMode}>
                <Breadcrumbs categoryId={categoryId} />
                <article
                    className={classes.root}
                    data-cy="CategoryContent-root"
                >
                    {categoryImageElement}
                    <CmsBlock identifiers={'category-top'} />
                    {!!cateId && <SuggestCategory id={cateId} />}

                    <div className={classes.categoryHeader}>
                        <div aria-live="polite" className={classes.title}>
                            <h1
                                className={classes.categoryTitle}
                                data-cy="CategoryContent-categoryTitle"
                            >
                                <div>{categoryTitle}</div>
                                <span className={classes.extendHeading}>
                                    {' '}<FormattedMessage id="global.extendHeading" defaultMessage="good price, home delivery" />
                                </span>
                            </h1>
                            <div
                                data-cy="CategoryContent-categoryInfo"
                                className={classes.categoryInfo}
                            >
                                {categoryResultsHeading}
                            </div>
                        </div>
                    </div>
                    <div className={classes.contentWrapper}>
                        <div ref={sidebarRef} className={classes.sidebar}>
                            <Suspense fallback={<FilterSidebarShimmer />}>
                                {shouldRenderSidebarContent ? sidebar : null}
                            </Suspense>
                        </div>
                        <div className={classes.categoryContent}>
                            <div className={classes.heading}>
                                <div className={classes.headerButtons}>
                                    {maybeFilterButtons}
                                    {maybeSortButton}
                                </div>
                                {/*{maybeSortContainer}*/}
                            </div>
                            {content}
                            <Suspense fallback={null}>{filtersModal}</Suspense>
                        </div>
                    </div>
                    {categoryDescriptionElement}
                </article>
            </div>
        </Fragment>
    );
};

export default CategoryContent;

CategoryContent.propTypes = {
    classes: shape({
        gallery: string,
        pagination: string,
        root: string,
        categoryHeader: string,
        title: string,
        categoryTitle: string,
        sidebar: string,
        categoryContent: string,
        heading: string,
        categoryInfo: string,
        headerButtons: string
    }),
    // sortProps contains the following structure:
    // [{sortDirection: string, sortAttribute: string, sortText: string},
    // React.Dispatch<React.SetStateAction<{sortDirection: string, sortAttribute: string, sortText: string}]
    sortProps: array,
    pageSize: number
};
