import React, {Suspense, useCallback, useMemo, useState} from 'react';
import defaultClasses from './orderSummary.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage} from "react-intl";
import Price from "@magento/venia-ui/lib/components/Price";
import Button from "@magento/venia-ui/lib/components/Button";
import {Trash} from "../../../static/icons";
import useOrderSummary from "../../../Talons/QuickOrder/OrderSummary/useOrderSummary";
import Cookies from "js-cookie";
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const OrderSummary = props => {
    const {
        data,
        totalPrice,
        totalCount
    } = props;

    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useOrderSummary();

    const {
        handleRemoveAll,
        handleAddToCart,
        loading
    } = talonProps

    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);

    const hasAlcoholProduct = useMemo(() => {
        return (data?.getQuickOrder?.items?.some(item => item?.product?.is_alcohol === true));
    }, [data]);

    const handleAgeConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        handleAddToCart(data);
        setAgeConfirmOpen(false);
    }, [data, handleAddToCart])

    const handleAddToCartAlcohol = useCallback(() =>{
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (hasAlcoholProduct && !ageConfirmedCookies) {
            setAgeConfirmOpen(true);
        } else {
            handleAddToCart(data);
        }
    }, [data, handleAddToCart, hasAlcoholProduct])

    return (
        <div className={classes.block}>
            <div className={classes.blockTitle}>
                <FormattedMessage
                    id={'addToCartButton.addItemToCartAriaLabel'}
                    defaultMessage={'Add to cart'}
                />
            </div>
            <div className={classes.blockContent}>
                <div className={classes.totalWrapper}>
                    <span className={classes.label}>
                        <FormattedMessage
                            id={'global.totalPrice'}
                            defaultMessage={'Total:'}
                        />
                    </span>
                    <span className={classes.count}>
                        <FormattedMessage
                            id={'global.resultCount'}
                            values={{
                                count: totalCount
                            }}
                            defaultMessage={'{count} Results'}
                        />
                    </span>
                </div>
                <div className={classes.actions}>
                    {
                        totalCount > 0 ? (
                            <>
                                <button className={classes.buttonRemoveAll} onClick={handleRemoveAll} disabled={loading}>
                                    <img src={Trash} alt={'trash'} />
                                    <FormattedMessage
                                        id={'global.removeAll'}
                                        defaultMessage={'Remove all'}
                                    />
                                </button>
                                <Button priority={'high'} onClick={(e) => handleAddToCartAlcohol(e)} disabled={loading}>
                                    <FormattedMessage
                                        id={'addToCartButton.addItemToCartAriaLabel'}
                                        defaultMessage={'Add to cart'}
                                    />
                                </Button>
                            </>
                        ) : (
                            <div className={classes.addToCart_disabled}>
                                <Button priority={'high'}>
                                    <FormattedMessage
                                        id={'addToCartButton.addItemToCartAriaLabel'}
                                        defaultMessage={'Add to cart'}
                                    />
                                </Button>
                            </div>
                        )
                    }
                </div>
            </div>
            {(hasAlcoholProduct && ageConfirmOpen) && (
                <Suspense fallback={null}>
                    <AlcoholDialog
                        isOpen={ageConfirmOpen}
                        setIsOpen={setAgeConfirmOpen}
                        onConfirm={handleAgeConfirm}
                        isBusy={loading}
                    />
                </Suspense>
            )}
        </div>
    )
}

export default OrderSummary
