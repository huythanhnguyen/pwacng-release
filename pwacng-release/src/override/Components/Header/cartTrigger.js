import React, {Fragment, Suspense} from 'react';
import {shape, string} from 'prop-types';
import {FormattedMessage, useIntl} from 'react-intl';

import {useCartTrigger} from '../../Talons/Header/useCartTrigger';

import {useStyle} from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Header/cartTrigger.module.css';
import cartTriggerCustomClasses from '@magenest/theme/BaseComponents/Header/extendStyle/cartTrigger.module.scss';
import {GET_ITEM_COUNT_QUERY} from '@magento/venia-ui/lib/components/Header/cartTrigger.gql';
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import {useHistory} from "react-router-dom";

const MiniCart = React.lazy(() => import('../MiniCart/miniCart'));

const CartTrigger = props => {
    const {
        handleLinkClick,
        handleTriggerClick,
        itemCount,
        isOpen,
        handleClose,
    } = useCartTrigger({
        queries: {
            getItemCountQuery: GET_ITEM_COUNT_QUERY
        }
    });
    const history = useHistory();
    const {isDesktop } = useMediaCheck();
    const classes = useStyle(defaultClasses, props.classes, cartTriggerCustomClasses);
    const { formatMessage } = useIntl();
    const buttonAriaLabel = formatMessage(
        {
            id: 'cartTrigger.ariaLabel',
            defaultMessage:
                'Toggle mini cart. You have {count} items in your cart.'
        },
        { count: itemCount }
    );
    const itemCountDisplay = itemCount > 99 ? '99+' : itemCount;
    const triggerClassName = isOpen
        ? classes.triggerContainer_open
        : classes.triggerContainer;

    const maybeItemCounter = itemCount ? (
        <span className={classes.counter} data-cy="CartTrigger-counter">
            {itemCountDisplay}
        </span>
    ) : null;

    return <Fragment>
        <div className={triggerClassName}>
            <button
                aria-expanded={isOpen}
                aria-label={buttonAriaLabel}
                className={classes.trigger}
                onClick={isDesktop ? handleTriggerClick : () => history.push('/cart')}
                data-cy="CartTrigger-trigger"
            >
                {
                    isDesktop && (
                        <FormattedMessage
                            id={'cartTrigger.label'}
                            defaultMessage={'My Cart'}
                        />
                    )
                }
                {maybeItemCounter}
            </button>
        </div>
        <Suspense fallback={null}>
            <MiniCart
                isOpen={isOpen}
                handleLinkClick={handleLinkClick}
                handleClose={handleClose}
            />
        </Suspense>
    </Fragment>;
};

export default CartTrigger;

CartTrigger.propTypes = {
    classes: shape({
        counter: string,
        link: string,
        openIndicator: string,
        root: string,
        trigger: string,
        triggerContainer: string
    })
};
