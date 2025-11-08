import React, {Suspense, useCallback, useState} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderItems.module.scss';
import {FormattedMessage} from "react-intl";
import Price from "@magento/venia-ui/lib/components/Price";
import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import {Link, useHistory} from 'react-router-dom';
import {useQuery} from "@apollo/client";
import {GET_STORE_CONFIG_DATA} from "@magento/peregrine/lib/talons/Gallery/gallery.gql";
import Cookies from "js-cookie";
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const OrderItems = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const {items} = props;

    const { data: storeConfigData } = useQuery(GET_STORE_CONFIG_DATA, {
        fetchPolicy: 'cache-and-network'
    });

    const storeConfig = storeConfigData ? storeConfigData.storeConfig : null;
    const productUrlSuffix = storeConfig && storeConfig.product_url_suffix;

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
        }
    }, [setAgeConfirmOpen, history])

    return (
        <>
            <table className={classes.items}>
                <tbody>
                {
                    items.length > 0 && (
                        items.map((item, index) => (
                            item.product && (
                                <tr className={classes.item} key={index}>
                                    <td className={classes.image}>
                                        <Link
                                            onClick={(e) => handleViewProduct(e, resourceUrl(`/${item.product.canonical_url}`), item.product.is_alcohol)}
                                            to={resourceUrl(`/${item.product.canonical_url}`)}
                                            className={item.product.is_alcohol ? `${classes.thumbnailContainer} ${classes.alcoholTag}` : classes.thumbnailContainer}
                                        >
                                            <img src={item.product.thumbnail?.url || '' } alt={item?.product?.ecom_name || item.product_name} width='80'/>
                                        </Link>
                                    </td>
                                    <td className={classes.info}>
                                        <Link
                                            onClick={(e) => handleViewProduct(e, resourceUrl(`/${item.product.canonical_url}`), item.product.is_alcohol)}
                                            to={resourceUrl(`/${item.product.canonical_url}`)}
                                        >
                                            <p className={classes.productName} title={item?.product?.ecom_name || item.product_name}>{item?.product?.ecom_name || item.product_name}</p>
                                            {
                                                item.product.dnr_price && (
                                                    <DnrLabel classes={classes} dnrData={item.product.dnr_price} />
                                                )
                                            }
                                        </Link>
                                    </td>
                                    <td className={classes.qty}>
                                        <span className={classes.label}>
                                            <FormattedMessage
                                                id={'global.qty'}
                                                defaultMessage={'Qty'}
                                            />
                                        </span>
                                        <span className={classes.value}>
                                            {item.quantity_ordered}
                                            {item.product?.unit_ecom ? ' ' + item.product.unit_ecom : ''}
                                        </span>
                                    </td>
                                    <td className={classes.amount}>
                                        <span className={classes.label}>
                                            <FormattedMessage
                                                id={'global.totalAmount'}
                                                defaultMessage={'Total amount'}
                                            />
                                        </span>
                                        <span className={classes.value}>
                                            <Price value={item.product_sale_price.value * item.quantity_ordered} currencyCode={item.product_sale_price.currency} />
                                        </span>
                                    </td>
                                </tr>
                            )
                        ))
                    )
                }
                </tbody>
            </table>
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

export default OrderItems;
