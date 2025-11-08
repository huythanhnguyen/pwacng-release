import React, {Fragment, Suspense, useCallback, useState, useEffect, useMemo} from 'react';
import { FormattedMessage } from 'react-intl';
import Cookies from "js-cookie";
import {useHistory} from "react-router-dom";
import { Trash } from '@magenest/theme/static/icons';
import { useStyle } from '@magento/venia-ui/lib/classify';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import defaultClasses from '@magento/venia-ui/lib/components/CartPage/ProductListing/productListing.module.css';
import productListingClasses from '@magenest/theme/BaseComponents/CartPage/extentStyle/productListing.module.scss';
import Product from './product';
import useMediaCheck from "@magenest/theme/Hooks/MediaCheck/useMediaCheck";
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

/**
 * A child component of the CartPage component.
 * This component renders the product listing on the cart page.
 *
 * @param {Object} props
 * @param {Function} props.setIsCartUpdating Function for setting the updating state of the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [productListing.module.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/productListing.module.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import ProductListing from "@magento/venia-ui/lib/components/CartPage/ProductListing";
 */
const ProductListing = props => {
    const {
        items,
        onAddToWishlistSuccess,
        setIsCartUpdating,
        fetchCartDetails,
        handleRemoveAll,
        removeAllCartLoading,
        subtotal,
        count,
        setSamePromotionDnr,
        onShowSamePromotion
    } = props;

    const { isMobile } = useMediaCheck();

    const classes = useStyle(defaultClasses, productListingClasses, props.classes);

    const history = useHistory();
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);
    const [productLink, setProductLink] = useState(null);

    const handleLinkConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        history.push(productLink);
        setProductLink(null);
        setAgeConfirmOpen(false);
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
        }
    }, [setAgeConfirmOpen, history])

    /*useEffect(() => {
        if (items.length) {
            const foundItem = items.find(i => i.have_same_promotion === true);
            if (foundItem) {
                setSamePromotionDnr(foundItem.id);
            } else {
                setSamePromotionDnr(null);
            }
        } else {
            setSamePromotionDnr(null);
        }
    }, [items, setSamePromotionDnr]);*/

    // Move useMemo outside of conditional rendering to ensure hooks are called consistently
    const groupedItems = useMemo(() => {
        const src = Array.isArray(items) ? items : []
        const getEvent = it => it?.product?.dnr_price?.[0]?.event_id || null;
        const groups = new Map();
        for (let i = 0; i < src.length; i++) {
            const it = src[i];
            const ev = getEvent(it);
            if (ev) {
                if (!groups.has(ev)) groups.set(ev, []);
                groups.get(ev).push(it);
            }
        }
        const emitted = new Set();
        const out = [];
        for (let i = 0; i < src.length; i++) {
            const it = src[i];
            const ev = getEvent(it);
            if (ev && groups.has(ev)) {
                if (!emitted.has(ev)) {
                    emitted.add(ev);
                    const group = groups.get(ev);
                    let dealGroupId = null;
                    for (let j = 0; j < group.length; j++) {
                        const g = group[j];
                        if (dealGroupId === null && g && g.have_great_deal && g.id != null) {
                            dealGroupId = g.id;
                        }
                    }
                    for (let j = 0; j < group.length; j++) {
                        const g = group[j];
                        out.push(Object.assign({}, g, { dealGroupId, isGroupLast: j === group.length - 1 }));
                    }
                }
            } else if (!ev) {
                out.push(Object.assign({}, it, { dealGroupId: null, isGroupLast: true }));
            }
        }
        return out;
    }, [items]);

    if (removeAllCartLoading) {
        return (
            <LoadingIndicator></LoadingIndicator>
        );
    }

    if (items.length) {

        const productComponents = groupedItems.map((product, index) => (
            <Product
                items={items}
                item={product}
                key={product.uid}
                setIsCartUpdating={setIsCartUpdating}
                onAddToWishlistSuccess={onAddToWishlistSuccess}
                fetchCartDetails={fetchCartDetails}
                index={++index}
                subtotal={subtotal}
                count={count}
                setSamePromotionDnr={setSamePromotionDnr}
                onShowSamePromotion={onShowSamePromotion}
                handleViewProduct={handleViewProduct}
            />
        ));

        return (
            <Fragment>
                <div className={classes.header}>
                    <div className={classes.title}>
                        <span>
                            <FormattedMessage
                                id={'global.productList'}
                                defaultMessage={'Product list'}
                            />
                        </span>
                        <span className={classes.listProductCount}>
                            (
                            {
                                isMobile ? (
                                    items.length
                                ) : (
                                    <FormattedMessage
                                        id={'global.totalQuantity'}
                                        defaultMessage={'{totalQuantity} Items'}
                                        values={{totalQuantity: items.length}}
                                    />
                                )
                            }
                            )
                        </span>
                    </div>
                    <button onClick={handleRemoveAll} className={classes.buttonRemoveAll}>
                        <img src={Trash} alt={'trash'} />
                        <FormattedMessage
                            id={'global.removeAllCart'}
                            defaultMessage={'Remove all cart'}
                        />
                    </button>
                </div>
                <ul className={classes.root} data-cy="ProductListing-root">
                    {productComponents}
                </ul>
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
            </Fragment>
        );
    }

    return null;
};

export default ProductListing;
