import React, {createContext, useMemo, useState, useEffect} from "react";
import {useQuery} from "@apollo/client";
import {GET_CUSTOMER_WISHLIST} from "../../../override/Talons/WishlistPage/wishlistPage.gql";
import {GET_PRODUCTS_IN_WISHLISTS} from '@magento/peregrine/lib/talons/Wishlist/AddToListButton/addToListButton.gql';
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useLocation} from "react-router-dom";

export const WishlistContext = createContext();

export const WishlistProvider = ({children}) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const [{ isSignedIn }] = useUserContext();
    const isMcardRoute = currentPath === '/mcard/';
    const [wishlistProducts, setWishlistProducts] = useState([]);

    const { data, error: derivedWishlistsError, loading: derivedWishlistsLoading } = useQuery(GET_CUSTOMER_WISHLIST, {
        fetchPolicy: 'cache-and-network',
        skip: !isSignedIn || isMcardRoute
    });

    const { client, data: wishlistProductsData } = useQuery(GET_PRODUCTS_IN_WISHLISTS, {
        fetchPolicy: 'cache-and-network',
        skip: !isSignedIn || isMcardRoute
    });

    const derivedWishlists = useMemo(() => {
        return (data && data.customer.wishlists) || [];
    }, [data]);

    useEffect(() => {
        if (wishlistProductsData) {
            setWishlistProducts(wishlistProductsData.customerWishlistProducts);
        }
    }, [wishlistProductsData]);

    return (
        <WishlistContext.Provider value={{derivedWishlists, derivedWishlistsError, derivedWishlistsLoading, wishlistProducts, setWishlistProducts, client}} >
            {children}
        </WishlistContext.Provider>
    )
}
