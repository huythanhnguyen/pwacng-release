import React, { useCallback, useState,useEffect } from 'react';
import {useQuery} from "@apollo/client";
import {GET_CUSTOMER_WISHLIST_ITEMS} from "./wishlist.gql";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const useWishlistItems = props => {
    const [, { addToast }] = useToasts();
    const {wishlistId} = props
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeAddToCartItem, setActiveAddToCartItem] = useState(null);

    const handleOpenAddToCartDialog = useCallback(wishlistItem => {
        setActiveAddToCartItem(wishlistItem);
    }, []);

    const handleCloseAddToCartDialog = useCallback(() => {
        setActiveAddToCartItem(null);
    }, []);

    const { data: itemsData, loading, error } = useQuery(
        GET_CUSTOMER_WISHLIST_ITEMS,
        {
            variables: {
                id: wishlistId,
                currentPage
            },
            fetchPolicy: 'cache-and-network',
            skip: !wishlistId
        }
    );
    // Error Apollo cache gây xung đột giữa nhiều wishlist => Khi mở multiple wishlist tab cần sử dụng fetchPolicy: 'no-cache' (Hoặc chỉ mở 1 tab wishlist 1 lúc)

    useEffect(() => {
        if (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [error]);

    useEffect(() => {
        if (itemsData) {
            setTotalPages(itemsData.customer?.wishlist_v2?.items_v2?.page_info?.total_pages || 1);
        }
    }, [itemsData])

    return {
        loading,
        itemsData,
        totalPages,
        currentPage,
        setCurrentPage,
        activeAddToCartItem,
        handleCloseAddToCartDialog,
        handleOpenAddToCartDialog
    };
};
