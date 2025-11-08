import React, {Suspense, useCallback, useMemo, useState} from 'react';
import { string, func, arrayOf, shape, number, oneOf } from 'prop-types';
import Cookies from "js-cookie";
import Item from './item';
import { useStyle } from '@magento/venia-ui/lib/classify';

import defaultClasses from '@magento/venia-ui/lib/components/MiniCart/ProductList/productList.module.css';
import productListClasses from '@magenest/theme/BaseComponents/MiniCart/extendStyle/productList.module.scss';
import {useHistory} from "react-router-dom";

const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const ProductList = props => {
    const {
        items,
        handleRemoveItem,
        classes: propClasses,
        closeMiniCart,
        configurableThumbnailSource,
        storeUrlSuffix,
        totalQuantity
    } = props;
    const classes = useStyle(defaultClasses, productListClasses, propClasses);

    const history = useHistory();
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);
    const [productLink, setProductLink] = useState(null);

    const handleLinkConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        history.push(productLink);
        setProductLink(null);
        setAgeConfirmOpen(false);
        closeMiniCart();
    }, [setAgeConfirmOpen, history, productLink])

    const handleViewProduct = useCallback((e, redirect, is_alcohol) => {
        e.preventDefault();
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (is_alcohol && !ageConfirmedCookies) {
            setProductLink(redirect);
            setAgeConfirmOpen(true);
        } else {
            history.push(redirect);
            setAgeConfirmOpen(false);
            closeMiniCart();
        }
    }, [setAgeConfirmOpen, history])

    const cartItems = useMemo(() => {
        if (items) {
            return items.map((item, index) => (
                <Item
                    key={item.uid}
                    {...item}
                    item={item}
                    closeMiniCart={closeMiniCart}
                    handleRemoveItem={handleRemoveItem}
                    configurableThumbnailSource={configurableThumbnailSource}
                    storeUrlSuffix={storeUrlSuffix}
                    totalQuantity={totalQuantity}
                    index={++index}
                    handleViewProduct={handleViewProduct}
                />
            ));
        }
    }, [
        items,
        handleRemoveItem,
        closeMiniCart,
        configurableThumbnailSource,
        storeUrlSuffix,
        totalQuantity,
        handleViewProduct
    ]);

    return (
        <>
            <div className={classes.root} data-cy="MiniCart-ProductList-root">
                {cartItems}
            </div>
            {(ageConfirmOpen) && (
                <Suspense fallback={null}>
                    <AlcoholDialog
                        isOpen={ageConfirmOpen}
                        setIsOpen={setAgeConfirmOpen}
                        onConfirm={handleLinkConfirm}
                        isBusy={false}
                    />
                </Suspense>
            )}
        </>
    );
};

export default ProductList;

ProductList.propTypes = {
    classes: shape({ root: string }),
    items: arrayOf(
        shape({
            product: shape({
                name: string,
                thumbnail: shape({
                    url: string
                })
            }),
            id: string,
            quantity: number,
            configurable_options: arrayOf(
                shape({
                    label: string,
                    value: string
                })
            ),
            prices: shape({
                price: shape({
                    value: number,
                    currency: string
                })
            }),
            configured_variant: shape({
                thumbnail: shape({
                    url: string
                })
            })
        })
    ),
    configurableThumbnailSource: oneOf(['parent', 'itself']),
    handleRemoveItem: func
};
