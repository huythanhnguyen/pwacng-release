import React, {Fragment, useMemo, useState, useEffect} from 'react';
import { useWishlistItems } from '@magento/peregrine/lib/talons/WishlistPage/useWishlistItems';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/WishlistPage/wishlistItems.module.css';
import wishlistItemsClasses from '@magenest/theme/BaseComponents/WishlistPage/extendStyle/wishlistItems.module.scss';
import WishlistItem from './wishlistItem';
import AddToCartDialog from '@magento/venia-ui/lib/components/AddToCartDialog';

import { useQuery } from '@apollo/client';
import { GET_CUSTOMER_WISHLIST_ITEMS } from '../../Talons/WishlistPage/wishlist.gql';
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import Pagination from "@magento/venia-ui/lib/components/Pagination";

import { AlertCircle as AlertCircleIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {FormattedMessage} from "react-intl";
import Button from "@magento/venia-ui/lib/components/Button";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const WishlistItems = props => {
    const { wishlistId } = props;

    const classes = useStyle(defaultClasses, wishlistItemsClasses, props.classes);

    const talonProps = useWishlistItems({wishlistId});
    const {
        loading,
        itemsData,
        totalPages,
        currentPage,
        setCurrentPage,
        activeAddToCartItem,
        handleCloseAddToCartDialog,
        handleOpenAddToCartDialog
    } = talonProps;

    /*const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages: itemsData?.customer?.wishlist_v2?.items_v2?.page_info?.total_pages || 1
    };*/

    return (
        <Fragment>
            <div className={classes.root}>
                {itemsData?.customer?.wishlist_v2?.items_v2?.items?.length > 0 && (
                    <>
                        {itemsData.customer.wishlist_v2.items_v2.items.map(item => (
                            <WishlistItem
                                key={item.id}
                                item={item}
                                onOpenAddToCartDialog={handleOpenAddToCartDialog}
                                wishlistId={wishlistId}
                            />
                        ))}
                    </>
                )}
                {loading && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
                {currentPage < totalPages && (
                    <button onClick={() => setCurrentPage(prev => prev + 1)} className={classes.loadMore}>
                        <FormattedMessage
                            id={'wishlist.loadMore'}
                            defaultMessage={'Load more'}
                        />
                    </button>
                )}
                {/*<Pagination pageControl={pageControl} />*/}
            </div>
            <AddToCartDialog
                item={activeAddToCartItem}
                onClose={handleCloseAddToCartDialog}
            />
        </Fragment>
    );
};

export default WishlistItems;
