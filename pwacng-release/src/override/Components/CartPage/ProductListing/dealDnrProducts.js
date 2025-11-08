import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {gql, useQuery} from '@apollo/client';
import { Link } from 'react-router-dom';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import Price from '@magento/venia-ui/lib/components/Price';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Image from '@magento/venia-ui/lib/components/Image';
import ProductOptions from '@magento/venia-ui/lib/components/LegacyMiniCart/productOptions';
import defaultClasses from '@magento/venia-ui/lib/components/CartPage/ProductListing/product.module.css';
import productClasses from '@magenest/theme/BaseComponents/CartPage/extentStyle/product.module.scss';
import SlideToggle from "react-slide-toggle";
import AddToCartButton from "../../Gallery/addToCartButton";
import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";
import {useCartContext} from "@magento/peregrine/lib/context/cart";

const IMAGE_SIZE = 100;

const DealDnrProducts = props => {
    const { items, id, urlSuffix } = props;

    const [{ cartId }] = useCartContext();
    const { data, refetch } = useQuery(GET_GREATDEAL_CART_ITEM, {
        variables: {
            cartId,
            itemId: id
        },
        fetchPolicy: 'cache-and-network'
    });

    useEffect(() => {
        refetch();
    }, [items, cartId, refetch]);

    if (!data?.getGreatDealCartItem?.length) {
        return <></>;
    }

    const classes = useStyle(defaultClasses, productClasses, props.classes);

    return (
        <SlideToggle collapsed={false}>
            {({ toggle, toggleState, setCollapsibleElement }) => (
                <>
                    <div className={`${toggleState === 'EXPANDED' ? `${classes.dnrTitle} ${classes.active}` : classes.dnrTitle}`} onClick={toggle}>
                        <FormattedMessage
                            id={'cartItem.dealProducts'}
                            defaultMessage={'Great deal'}
                        />
                    </div>
                    <ul className={classes.dealDnrProducts} ref={setCollapsibleElement}>
                        {data.getGreatDealCartItem.map((item, index) => (
                            <li key={index} className={classes.root} data-cy="Product-root">
                                <span className={`${classes.count} ${classes.countHide}`}>
                                    {''}
                                </span>
                                <div className={classes.item}>
                                    <Link
                                        to={resourceUrl(`/${item.canonical_url}`)}
                                        className={classes.imageContainer}
                                        data-cy="Product-imageContainer"
                                    >
                                        <Image
                                            alt={item.ecom_name || item.name}
                                            classes={{
                                                root: classes.imageRoot,
                                                image: classes.image
                                            }}
                                            width={IMAGE_SIZE}
                                            height={IMAGE_SIZE}
                                            resource={item.small_image.url}
                                            data-cy="Product-image"
                                        />
                                    </Link>
                                    <div className={classes.details}>
                                        <div className={classes.name} data-cy="Product-name">
                                            <Link to={resourceUrl(`/${item.canonical_url}`)}>{item.ecom_name || item.name}</Link>
                                        </div>
                                        <ProductOptions
                                            options={item.options}
                                            classes={{
                                                options: classes.options,
                                                optionLabel: classes.optionLabel
                                            }}
                                        />
                                        <div className={classes.priceBox}>
                                            <strong className={classes.price}>
                                                <Price
                                                    currencyCode={item.price_range.maximum_price.final_price.currency}
                                                    value={item.price_range.maximum_price.final_price.value}
                                                />
                                            </strong>
                                            {
                                                item.price_range.maximum_price.final_price.value < item.price_range.maximum_price.regular_price.value && (
                                                    <span className={classes.regularPrice}>
                                                        <Price
                                                            currencyCode={item.price_range.maximum_price.regular_price.currency}
                                                            value={item.price_range.maximum_price.regular_price.value}
                                                        />
                                                    </span>
                                                )
                                            }
                                        </div>
                                        {
                                            item.dnr_price && (
                                                <DnrLabel classes={classes} dnrData={item.dnr_price} />
                                            )
                                        }
                                    </div>
                                    <div className={classes.actions}>
                                        <AddToCartButton
                                            item={item}
                                            urlSuffix={urlSuffix}
                                        />
                                    </div>
                                    <div className={classes.finalPrice}></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </SlideToggle>
    );
};

export default DealDnrProducts;

export const GET_GREATDEAL_CART_ITEM = gql`
    query getGreatDealCartItem(
        $cartId: String!
        $itemId: String!
    ) {
        getGreatDealCartItem(
            cart_id: $cartId
            cart_item_id: $itemId
        ) {
            id
            uid
            art_no
            name
            ecom_name
            mm_product_type
            sku
            url_key
            canonical_url
            thumbnail {
                url
            }
            dnr_price {
                qty
                promo_label
                promo_type
                promo_amount
                promo_value
                event_id
                event_name
            }
            small_image {
                url
            }
            price_range {
                maximum_price {
                    final_price {
                        currency
                        value
                    }
                    regular_price {
                        currency
                        value
                    }
                    discount {
                        amount_off
                    }
                }
            }
            price {
                regularPrice {
                    amount {
                        value
                    }
                }
            }
            stock_status
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            ... on ConfigurableProduct {
                variants {
                    attributes {
                        uid
                        code
                        value_index
                    }
                    # eslint-disable-next-line @graphql-eslint/require-id-when-available
                    product {
                        uid
                        stock_status
                        small_image {
                            url
                        }
                    }
                }
            }
        }
    }
`;
