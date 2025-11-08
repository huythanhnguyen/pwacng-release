import React, {useCallback, useContext, useEffect} from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/ProductFullDetail/extendStyle/similarProducts.module.scss';
import sliderCustomClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/slider.module.scss';

import Price from '@magento/venia-ui/lib/components/Price';
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import SlickSlider from "react-slick";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import {useMutation, useQuery} from "@apollo/client";
import {MiniCartContext} from "../../../@theme/Context/MiniCart/MiniCartContext";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import operations from "../Gallery/updateCartItem.gql";
import { REMOVE_ITEM_MUTATION } from  '@magento/venia-ui/lib/components/LegacyMiniCart/cartOptions.gql';
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";
import {useToasts} from "@magento/peregrine";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const DnrProducts = props => {
    const classes = useStyle(defaultClasses, sliderCustomClasses, props.classes);
    const {
        isSignedIn,
        currentUser,
        storeCode,
        storeName,
        currentProductUid,
        products,
        currencyCode,
        title,
        type = null,
        dealProducts = [],
        setDealProducts = () => {},
        giftProducts = [],
        setGiftProducts = () => {}
    } = props;

    const [, { addToast }] = useToasts();
    const [, { dispatch }] = useEventingContext();
    const [{ cartId }] = useCartContext();
    const { miniCartProductList } = useContext(MiniCartContext);

    useEffect(() => {
        if ((type === 'deal' || type === 'gift') && products.length && miniCartProductList && Object.keys(miniCartProductList).length) {
            products.forEach(item => {
                const uid = item.product.uid;
                const quantity = miniCartProductList[uid]?.quantity || 0;
                if (type === 'deal') {
                    setDealProducts(prev => {
                        if (prev.length > 0) {
                            return [
                                ...prev.filter(p => p.sku !== item.product.sku),
                                {
                                    quantity,
                                    entered_options: [{uid: item.product.uid, value: item.product.name}],
                                    sku: item.product.sku
                                }
                            ]
                        } else {
                            return [{
                                quantity,
                                entered_options: [{uid: item.product.uid, value: item.product.name}],
                                sku: item.product.sku
                            }]
                        }
                    });
                } else if (type === 'gift') {
                    setGiftProducts(prev => {
                        if (prev.length > 0) {
                            return [
                                ...prev.filter(p => p.sku !== item.product.sku),
                                {
                                    quantity,
                                    entered_options: [{uid: item.product.uid, value: item.product.name}],
                                    sku: item.product.sku
                                }
                            ]
                        } else {
                            return [{
                                quantity,
                                entered_options: [{uid: item.product.uid, value: item.product.name}],
                                sku: item.product.sku
                            }]
                        }
                    });
                }
            });
        }
    }, [type, products, miniCartProductList])

    const toggleProduct = (item, type) => {
        const setProducts = { deal: setDealProducts, gift: setGiftProducts }[type];
        if (!setProducts) return
        setProducts(prev => {
            if (prev.length > 0) {
                const quantityDefault = (item.product.mm_product_type && item.product.mm_product_type === 'F') ? 0.5 : 1;
                const quantityOld = prev.filter(p => p.sku === item.product.sku)?.[0]?.quantity || 0;
                const quantity = quantityOld ? 0 : (miniCartProductList[item.product.uid]?.quantity || quantityDefault);
                if (currentProductUid && miniCartProductList[currentProductUid]?.quantity) {
                    if (quantity > 0) {
                        handleAddToCart(item, quantity)
                    } else {
                        handleRemoveCartItem(item, quantityOld, miniCartProductList[item.product.uid]?.cart_item_uid)
                    }
                }
                return [
                    ...prev.filter(p => p.sku !== item.product.sku),
                    {
                        quantity,
                        entered_options: [{uid: item.product.uid, value: item.product.name}],
                        sku: item.product.sku
                    }
                ]
            } else {
                const quantity = miniCartProductList[item.product.uid]?.quantity || 1;
                return [{
                    quantity,
                    entered_options: [{uid: item.product.uid, value: item.product.name}],
                    sku: item.product.sku
                }]
            }
        });
    };

    const [addToCart] = useMutation(operations.ADD_ITEM);
    const [removeCartItem] = useMutation(REMOVE_ITEM_MUTATION);
    const handleAddToCart = useCallback(async (item, quantity) => {
        try {
            const result = await addToCart({
                variables: {
                    cartId,
                    cartItem: {
                        quantity,
                        entered_options: [
                            {
                                uid: item.product.uid,
                                value: item.product.name
                            }
                        ],
                        sku: item.product.sku
                    }
                }
            });

            dispatch({
                type: 'CART_ADD_ITEM',
                payload: {
                    cartId,
                    sku: item.product.sku,
                    name: item.product.name,
                    pricing: {
                        regularPrice: {
                            amount: item.old_price || item.price
                        }
                    },
                    priceTotal: item.price,
                    currencyCode: currencyCode,
                    discountAmount: (item.old_price && item.old_price > item.price) ? (item.old_price - item.price) : 0,
                    selectedOptions: null,
                    quantity
                }
            });

            if (result) {
                const errors = result?.data?.addProductsToCart?.user_errors || [];
                const cart_subtotal = result?.data?.addProductsToCart?.cart?.prices?.subtotal_excluding_tax?.value || 0;
                const cart_item_count = result?.data?.addProductsToCart?.cart?.total_quantity || 0;

                errors && errors.map(error => (
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: error.message,
                        dismissable: true,
                        timeout: 7000
                    })
                ))

                if (!miniCartProductList[item.product.uid]) {
                    ReactGA.event('add_to_cart', {
                        category: "Ecommerce",
                        label: "Add to Cart",
                        store_id: storeCode,
                        store_name: storeName,
                        items: [
                            {
                                item_id: `${item.product.art_no}_${storeCode}`,
                                item_name: item.product.name,
                                price: item.price,
                                quantity
                            }
                        ]
                    });
                }

                const productLink = resourceUrl(
                    `/${item.product.canonical_url}`
                );

                const productItemsTrack = {
                    "type": "product", // Fixed Value
                    "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                    "name": item.product.name,
                    "sku": item.product.sku, // ArtNo + "_" + Barcode
                    "page_url": `${window.location.origin}${productLink}`,
                    "image_url": item.product.small_image?.url || "",
                    "store_id": storeCode,
                    "store_name": storeName,
                    "price": item.price,
                    "original_price": item.old_price || item.price,
                    "main_category": item.product.categories?.[0]?.name || "Unknown",
                    "brand": "NO BRAND",
                    "quantity": quantity
                };
                if (isSignedIn && currentUser) {
                    const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                    window.web_event.track("product", "add_to_cart", {
                        items: [productItemsTrack],
                        dims: {
                            customers: {
                                "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                "name": currentUser.firstname,
                                "email": currentUser.email,
                                "phone": customerPhoneNumber
                            }
                        },
                        extra: {
                            "event_source": "add_to_cart",
                            "cart_subtotal": cart_subtotal,
                            "cart_item_count": cart_item_count
                        }
                    })
                } else {
                    window.web_event.track("product", "add_to_cart", {
                        items: [productItemsTrack],
                        extra: {
                            "event_source": "add_to_cart",
                            "cart_subtotal": cart_subtotal,
                            "cart_item_count": cart_item_count
                        }
                    })
                }
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            })
        }
    }, [cartId, storeCode, storeName]);
    const handleRemoveCartItem = useCallback(async (item, quantityOld, cartItemUid) => {
        try {
            const result = await removeCartItem({
                variables: {
                    cartId,
                    itemId: cartItemUid
                }
            });

            dispatch({
                type: 'CART_REMOVE_ITEM',
                payload: {
                    cartId,
                    sku: item.product.sku,
                    name: item.product.name,
                    pricing: {
                        regularPrice: {
                            amount: item.old_price || item.price
                        }
                    },
                    priceTotal: item.price,
                    currencyCode: currencyCode,
                    discountAmount: (item.old_price && item.old_price > item.price) ? (item.old_price - item.price) : 0,
                    selectedOptions: null,
                    quantity: quantityOld
                }
            });

            if (result) {
                const cart_subtotal = result?.data?.removeItemFromCart?.cart?.prices?.subtotal_excluding_tax?.value || 0;
                const cart_item_count = result?.data?.removeItemFromCart?.cart?.total_quantity || 0;

                ReactGA.event('remove_from_cart', {
                    category: "Ecommerce",
                    label: "Remove from Cart",
                    store_id: storeCode,
                    store_name: storeName,
                    items: [
                        {
                            item_id: `${item.product.art_no}_${storeCode}`,
                            item_name: item.product.name,
                            price: item.price || 0,
                            quantity: quantityOld
                        }
                    ]
                });

                if (isSignedIn && currentUser) {
                    const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                    window.web_event.track("product", "remove_cart", {
                        items: [
                            {
                                "type": "product",
                                "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                "quantity": quantityOld,
                                "name": item.product.name
                            }
                        ],
                        dims: {
                            customers: {
                                "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                "name": currentUser.firstname,
                                "email": currentUser.email,
                                "phone": customerPhoneNumber
                            }
                        },
                        extra: {
                            "cart_subtotal": cart_subtotal,
                            "cart_item_count": cart_item_count
                        }
                    })
                } else {
                    window.web_event.track("product", "remove_cart", {
                        items: [
                            {
                                "type": "product",
                                "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                "quantity": quantityOld,
                                "name": item.product.name
                            }
                        ],
                        extra: {
                            "cart_subtotal": cart_subtotal,
                            "cart_item_count": cart_item_count
                        }
                    })
                }
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            })
        }
    }, [cartId, storeCode, storeName]);

    const productItem = (item, isCurrent) => {
        const productLink = resourceUrl(`/${item.product.canonical_url}`);
        const oldPrice = item.old_price || 0;
        const finalPrice = item.price || 0;

        const productContent = (
            <>
                { (type === 'deal' || type === 'gift') ? (
                    <Link to={productLink}>
                        <span className={classes.itemImage}>
                            <span className={classes.image}>
                                <img src={item.product.small_image.url} alt={item.product.name} width='80'/>
                            </span>
                            <h3 className={classes.itemName} title={item.product.name}>{item.product.ecom_name}</h3>
                        </span>
                    </Link>
                ) : (
                    <span className={classes.itemImage}>
                        <span className={classes.image}>
                            <img src={item.product.small_image.url} alt={item.product.name} width='80'/>
                        </span>
                        <h3 className={classes.itemName} title={item.product.name}>{item.product.ecom_name}</h3>
                    </span>
                )}
                <span className={classes.priceWrapper}>
                    { (type === 'deal' || type === 'gift') && (
                        <span
                            className={`${classes.dealAction} ${
                                (type === 'deal')
                                    ? (dealProducts?.filter(p => p.sku === item.product.sku)?.[0]?.quantity ? classes.active : '')
                                    : (giftProducts?.filter(p => p.sku === item.product.sku)?.[0]?.quantity ? classes.active : '')
                            }`}
                            onClick={() => toggleProduct(item, type)}
                            aria-label={'Select'}
                        ></span>
                    )}
                    { type === 'gift' ? (
                        <span className={classes.finalPrice}>
                            <Price currencyCode={currencyCode} value={'0'} />
                        </span>
                    ) : (
                        <>
                            <span className={classes.finalPrice}>
                                <Price currencyCode={currencyCode} value={finalPrice} />
                            </span>
                            {oldPrice > finalPrice && (
                                <span className={classes.oldPrice}>
                                    <Price currencyCode={currencyCode} value={oldPrice} />
                                </span>
                            )}
                        </>
                    )}
                </span>
            </>
        );

        return (
            <div className={`${classes.item} ${!!isCurrent && classes.itemCurrent} ${!!type && 'item--' + type}`} key={item.product.uid}>
                {(isCurrent || type === 'deal' || type === 'gift') ? productContent : <Link to={productLink}>{productContent}</Link>}
            </div>
        );
    }

    const sliderProps = {
        arrows: true,
        dots: false,
        infinite: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        variableWidth: true,
        draggable: true,
        swipeToSlide: true,
        responsive: [
            {
                breakpoint: 1325,
                settings: {
                    slidesToShow: 3
                }
            }
        ]
    }

    const { isMobile } = useMediaCheck();
    const isSlider = !isMobile && products.length > 2;

    return (
        <div className={classes.similarProducts}>
            <div className={classes.similarProductsTitle}>{title}</div>
            <div className={classes.similarProductsInner}>
                {
                    isSlider ? (
                        <SlickSlider {...sliderProps}>
                            {products.length > 0 && products.map(item => productItem(item, false))}
                        </SlickSlider>
                    ) : (
                        <div className={classes.gallery}>
                            {products.length > 0 && products.map(item => productItem(item, false))}
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default DnrProducts;
