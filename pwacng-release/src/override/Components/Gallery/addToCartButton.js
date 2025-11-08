import React, {Suspense, useCallback, useContext, useEffect, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { string, number, shape } from 'prop-types';
// import { useAddToCartButton } from '@magento/peregrine/lib/talons/Gallery/useAddToCartButton';
import { useUpdateCartItem } from './useUpdateCartItem';
// import { ShoppingBag, XSquare } from 'react-feather';
// import Icon from '@magento/venia-ui/lib/components/Icon';
import Button from '@magento/venia-ui/lib/components/Button';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/Gallery/extendStyle/addToCartButton.module.scss';
import Cookies from "js-cookie";
// import {Input} from "postcss";
// import { MiniCartContext } from '@magenest/theme/Context/MiniCart/MiniCartContext';
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const AddToCartButton = props => {
    const { item, urlSuffix, label, outOfStocklabel, subtotal, isSearchSuggestion = false, searchValue } = props;
    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, props.classes);

    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);

    const talonProps = useUpdateCartItem({
        item,
        urlSuffix,
        subtotal,
        isSearchSuggestion,
        searchValue
    });

    const {
        handleAddToCart,
        handleUpdateCartItem,
        isDisabled,
        isInStock ,
        handleBlur,
        handleKeyPress,
        quantityInCart,
        isInputFocused,
        cartItemUid,
        quantityUpdate,
        setIsInputFocused
    } = talonProps;

    const [quantityInput, setQuantityInput] = useState(quantityUpdate || 0);

    useEffect(() => {
        setQuantityInput(quantityUpdate || 0);
    }, [isInputFocused, quantityUpdate]);

    const handleAgeConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        handleAddToCart();
        setAgeConfirmOpen(false);
    }, [handleAddToCart])

    const handleAddToCartAlcohol = useCallback(() =>{
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (item.is_alcohol && !ageConfirmedCookies) {
            setAgeConfirmOpen(true);
        } else {
            handleAddToCart();
        }
    }, [handleAddToCart])

    const buttonInStock = (
        quantityInCart ?
        (
            <div className={`${classes.qtyWrapper} ${isInputFocused ? classes.qtyInputShow : ''}`}>
                <div className={classes.qtyInner}>
                    <div className={classes.qtyInputWrap}>
                        <Button
                            data-cy="AddToCartButton-buttonInStock"
                            aria-label={formatMessage({
                                id: 'addToCartButton.addItemToCartAriaLabel',
                                defaultMessage: 'Add to Cart'
                            })}
                            className={`${classes.root} ${classes.reduce}`}
                            disabled={isDisabled}
                            onPress={() => handleUpdateCartItem(
                                cartItemUid,
                                (item.mm_product_type && item.mm_product_type === 'F') ? quantityInCart - 0.5 : quantityInCart - 1
                            )}
                            priority="high"
                            type="button"
                        >
                            <span className={classes.text}>-</span>
                        </Button>
                        <input type="number" min="0"
                               value={quantityInput}
                               onChange={(e) => {
                                   const value = e.target.value;
                                   const isFloatAllowed = item.mm_product_type === 'F';

                                   const floatRegex = /^\d*(\.\d?)?$/;     // ví dụ: 1, 1., 1.2
                                   const integerRegex = /^\d+$/;           // ví dụ: 1, 123 (không dấu .)
                                   if (
                                       (isFloatAllowed && floatRegex.test(value)) ||
                                       (!isFloatAllowed && integerRegex.test(value))
                                   ) {
                                       setQuantityInput(value);
                                   }
                               }}
                               onFocus={() => setIsInputFocused(true)}
                               onBlur={handleBlur}
                               onKeyPress={handleKeyPress}
                               disabled={isDisabled}
                        />
                        <Button
                            data-cy="AddToCartButton-buttonInStock"
                            aria-label={formatMessage({
                                id: 'addToCartButton.addItemToCartAriaLabel',
                                defaultMessage: 'Add to Cart'
                            })}
                            className={`${classes.root} ${classes.increase}`}
                            disabled={isDisabled}
                            onPress={handleAddToCart}
                            priority="high"
                            type="button"
                        >
                            <span className={classes.text}>+</span>
                        </Button>
                    </div>
                </div>
            </div>
        ) :
        (
            <>
                <Button
                    data-cy="AddToCartButton-buttonInStock"
                    aria-label={formatMessage({
                        id: 'addToCartButton.addItemToCartAriaLabel',
                        defaultMessage: 'Add to Cart'
                    })}
                    className={`${classes.root} ${classes.addToCart}`}
                    disabled={isDisabled}
                    onPress={handleAddToCartAlcohol}
                    priority="high"
                    type="button"
                >
                    <span className={classes.text}>
                        {
                            label ? label : (
                                <FormattedMessage
                                    id="addToCartButton.addItemToCart"
                                    defaultMessage="Add to Cart"
                                />
                            )
                        }
                    </span>
                </Button>
                {(item.is_alcohol && ageConfirmOpen) && (
                    <Suspense fallback={null}>
                        <AlcoholDialog
                            isOpen={ageConfirmOpen}
                            setIsOpen={setAgeConfirmOpen}
                            onConfirm={handleAgeConfirm}
                            isBusy={isDisabled}
                        />
                    </Suspense>
                )}
            </>
        )
    );

    const buttonOutOfStock = (
        <Button
            data-cy="AddtoCartButton-buttonOutOfStock"
            aria-label={formatMessage({
                id: 'addToCartButton.itemOutOfStockAriaLabel',
                defaultMessage: 'Out of Stock'
            })}
            className={`${classes.root} ${classes.addToCart} ${classes.outOfStock}`}
            disabled={isDisabled}
            onPress={handleAddToCart}
            priority="high"
            type="button"
        >
            <span className={classes.text}>
                {
                    outOfStocklabel ? outOfStocklabel : (
                        <FormattedMessage
                            id="addToCartButton.itemOutOfStock"
                            defaultMessage="OUT OF STOCK"
                        />
                    )
                }
            </span>
        </Button>
    );

    return isInStock ? buttonInStock : buttonOutOfStock;
};

export default AddToCartButton;

AddToCartButton.propTypes = {
    classes: shape({
        root: string,
        root_selected: string,
        addToCart: string,
        outOfStock: string
    }),
    item: shape({
        uid: string.isRequired,
        name: string.isRequired,
        small_image: shape({
            url: string
        }),
        stock_status: string.isRequired,
        __typename: string.isRequired,
        url_key: string.isRequired,
        url_suffix: string,
        sku: string.isRequired,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    value: number,
                    currency: string
                })
            })
        })
    }),
    urlSuffix: string
};
