import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {gql, useQuery} from '@apollo/client';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/CartPage/extentStyle/cartPage.module.scss';
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import { ProductFragment } from '../../Product/productFragment.gql';
import Gallery from "../../Gallery/gallery";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";

const IMAGE_SIZE = 100;

const SamePromotionDnrProducts = props => {
    const { cartItems, id } = props;

    const [{ cartId }] = useCartContext();
    const { data, loading, refetch } = useQuery(GET_SAME_PROMOTION_CART_ITEM, {
        variables: {
            cartId,
            itemId: id
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    useEffect(() => {
        refetch();
    }, [cartItems, id, refetch]);

    if (loading && !data?.getSamePromotionCartItem?.length) return <LoadingIndicator />;

    if (!data?.getSamePromotionCartItem?.length) return <></>;

    const classes = useStyle(defaultClasses, props.classes);

    return (
        <div className={classes.crossSellProduct}>
            <div className={classes.title}>
                <strong>
                    <FormattedMessage
                        id={'cartItem.samePromotionProducts'}
                        defaultMessage={'Products with the same promotion'}
                    />
                </strong>
            </div>
            <div className={classes.productsGallery}>
                <Gallery
                    items={data.getSamePromotionCartItem}
                    isSlider={true}
                    slideToShow={4}
                    sliderConfig={[
                        {
                            breakpoint: 1480,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                                ...{infinite: data.getSamePromotionCartItem.length > 3}
                            }
                        },
                        {
                            breakpoint: 1023,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                ...{infinite: data.getSamePromotionCartItem.length > 2}
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: "unslick"
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default SamePromotionDnrProducts;

export const GET_SAME_PROMOTION_CART_ITEM = gql`
    query getSamePromotionCartItem(
        $cartId: String!
        $itemId: String!
    ) {
        getSamePromotionCartItem(
            cart_id: $cartId
            cart_item_id: $itemId
        ) {
            sku
            __typename
            uid
            ...ProductFragment
        }
    }
    ${ProductFragment}
`;
