import React, { Fragment } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Price from '@magento/venia-ui/lib/components/Price';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { ChevronDown as ArrowDown, ChevronUp as ArrowUp } from 'react-feather';
import defaultClasses from '@magento/venia-ui/lib/components/CartPage/PriceSummary/discountSummary.module.css';
import AnimateHeight from 'react-animate-height';
import { useDiscountSummary } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/useDiscountSummary';

const MINUS_SYMBOL = '-';

/**
 * A component that renders the discount summary line item.
 *
 * @param {Object} props.classes
 * @param {Object} props.data fragment response data
 */
const DiscountSummary = props => {
    const {
        currency
    } = props
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const {
        totalDiscount,
        discountData,
        expanded,
        handleClick
    } = useDiscountSummary(props);

    return <Fragment>
        <li className={classes.lineItems}>
            <span
                className={classes.lineItemLabel}
                data-cy="PriceSummary-DiscountSummary-Label"
            >
                <FormattedMessage
                    id={'global.discount'}
                    defaultMessage={'Discount'}
                />
                {/*<button*/}
                {/*    onClick={handleClick}*/}
                {/*    data-cy="DiscountSummary-DiscountValue-TriggerButton"*/}
                {/*    type="button"*/}
                {/*    aria-expanded={expanded}*/}
                {/*    aria-label={toggleDiscountsAriaLabel}*/}
                {/*    className={classes.discountsButton}*/}
                {/*>*/}
                {/*    <Icon src={iconSrc} />*/}
                {/*</button>*/}
            </span>
            {
                totalDiscount?.value ? (
                    <span
                        data-cy="DiscountSummary-discountValue"
                        className={classes.price}
                    >
                    {MINUS_SYMBOL}
                    <Price
                        value={totalDiscount.value}
                        currencyCode={totalDiscount.currency || currency}
                    />
                </span>
                ) : (
                    <span
                        data-cy="DiscountSummary-discountValue"
                        className={classes.price}
                    >
                        <Price
                            value={0}
                            currencyCode={currency}
                        />
                    </span>
                )
            }
        </li>
    </Fragment>
};

export default DiscountSummary;
