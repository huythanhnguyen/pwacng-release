import React, {useCallback, useContext, useEffect, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { string, number, shape } from 'prop-types';
// import { useAddToCartButton } from '@magento/peregrine/lib/talons/Gallery/useAddToCartButton';
import { useUpdateCartItem } from './useUpdateCartItem';
// import { ShoppingBag, XSquare } from 'react-feather';
// import Icon from '@magento/venia-ui/lib/components/Icon';
import Button from '@magento/venia-ui/lib/components/Button';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/Gallery/extendStyle/addToCartButton.module.scss';
// import {Input} from "postcss";
// import { MiniCartContext } from '@magenest/theme/Context/MiniCart/MiniCartContext';

const AddToCartButton = props => {
    const { item, urlSuffix, label, dealProducts, giftProducts } = props;
    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useUpdateCartItem({
        item,
        urlSuffix,
        dealProducts,
        giftProducts
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

    const buttonInStock = (
        quantityInCart ?
        (
            <div className={`${classes.qtyWrapper} ${classes.qtyInputShow}`}>
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
            <Button
                data-cy="AddToCartButton-buttonInStock"
                aria-label={formatMessage({
                    id: 'addToCartButton.addItemToCartAriaLabel',
                    defaultMessage: 'Add to Cart'
                })}
                className={`${classes.root} ${classes.addToCart}`}
                disabled={isDisabled}
                onPress={handleAddToCart}
                priority="high"
                type="button"
            >
                <span className={classes.text}>
                    {
                        label ? label : (
                            <FormattedMessage
                                id="addToCartButton.buy"
                                defaultMessage="Buy"
                            />
                        )
                    }
                </span>
            </Button>
        )
    );

    const buttonOutOfStock = (
        <Button
            data-cy="AddtoCartButton-buttonOutOfStock"
            aria-label={formatMessage({
                id: 'addToCartButton.itemOutOfStockAriaLabel',
                defaultMessage: 'Out of Stock'
            })}
            className={`${classes.root} ${classes.outOfStock}`}
            disabled={isDisabled}
            onPress={handleAddToCart}
            priority="high"
            type="button"
        >
            <span className={classes.text}>
                <FormattedMessage
                    id="addToCartButton.itemOutOfStock"
                    defaultMessage="OUT OF STOCK"
                />
            </span>
        </Button>
    );

    return isInStock ? buttonInStock : buttonOutOfStock;
};

export default AddToCartButton;

AddToCartButton.propTypes = {
    classes: shape({
        root: string,
        root_selected: string
    }),
    item: shape({
        id: number.isRequired,
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
