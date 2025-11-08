import React, {useCallback} from "react";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import defaultOperations from "../quickOrder.gql";
import {useMutation, useQuery} from "@apollo/client";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {GET_ITEM_COUNT_QUERY} from "@magento/venia-ui/lib/components/Header/cartTrigger.gql";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {MINI_CART_QUERY} from "@magento/venia-ui/lib/components/MiniCart/miniCart.gql";
import updateCartItemOperations from "../updateCartItems.gql";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const UseOrderSummary = props => {
    const operations = mergeOperations(defaultOperations, updateCartItemOperations);
    const {
        ADD_ITEMS,
        removeAllQuickOrder,
        getQuickOrder,
        addAllItemToCart
    } = operations;
    const [, { addToast }] = useToasts();
    const [{ cartId }] = useCartContext();

    const [ addToCart, {loading: addItemsLoading} ] = useMutation(ADD_ITEMS);
    const [ fetchRemoveAllQuickOrder, {loading: removeAllQuickOrderLoading} ] = useMutation(removeAllQuickOrder);
    const [ fetchAddAllItemToCart, {loading: addToCartLoading} ] = useMutation(addAllItemToCart);

    const handleRemoveAll = useCallback(async () => {
        try {
            await fetchRemoveAllQuickOrder({
                refetchQueries: [{query: getQuickOrder}]
            })
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, []);

    const handleAddToCart = useCallback(async (data) => {
        try {
            const cartItems = (data?.getQuickOrder?.items || []).map(item => ({
                quantity: item.qty || 1,
                sku: item.product.sku,
                entered_options: [
                    {
                        uid: item.product.uid,
                        value: item.product.name
                    }
                ],
                ...(item?.product?.supplier_offers?.offers?.[0]?.offer_id && {
                    offer_id: item.product.supplier_offers.offers[0].offer_id
                })
            }));

            const result = await addToCart({
                variables: {
                    cartId,
                    cartItems
                }
            });

            if (result) {
                await fetchAddAllItemToCart({
                    refetchQueries: [
                        {query: getQuickOrder},
                        {
                            query: GET_ITEM_COUNT_QUERY,
                            fetchPolicy: 'cache-and-network',
                            nextFetchPolicy: 'cache-first',
                            variables: {
                                cartId
                            },
                            skip: !cartId,
                            errorPolicy: 'all'
                        },
                        {
                            query: MINI_CART_QUERY,
                            fetchPolicy: 'cache-and-network',
                            nextFetchPolicy: 'cache-first',
                            variables: {cartId},
                            skip: !cartId,
                            errorPolicy: 'all'
                        }
                    ]
                })
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [cartId])

    return {
        handleRemoveAll,
        handleAddToCart,
        loading: removeAllQuickOrderLoading || addToCartLoading || addItemsLoading
    }
}

export default UseOrderSummary
