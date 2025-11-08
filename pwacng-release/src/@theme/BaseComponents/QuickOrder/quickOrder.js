import React, {useState} from 'react';
import defaultClasses from './quickOrder.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import StaticBreadcrumbs from "../../../override/Components/Breadcrumbs/staticBreadcrumbs";
import {StoreTitle} from "@magento/venia-ui/lib/components/Head";
import {FormattedMessage, useIntl} from "react-intl";
import QuickFormCreate from "./QuickFormCreate/quickFormCreate";
import ListOrder from "./ListOrder/listOrder";
import OrderSummary from "./OrderSummary/orderSummary";
import useQuickOrder from "../../Talons/QuickOrder/useQuickOrder";
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";

const QuickOrder = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const talonProps = useQuickOrder();

    const {
        data,
        totalPrice
    } = talonProps;

    return (
        <div className={classes.root}>
            <StoreTitle>
                {formatMessage({
                    id: 'global.quickOrder',
                    defaultMessage: 'Quick Order'
                })}
            </StoreTitle>
            <div className={classes.breadcrumbs}>
                <StaticBreadcrumbs pageTitle={
                    formatMessage(
                        {
                            id: "global.quickOrder",
                            defaultMessage: 'Quick Order'
                        }
                    )
                } />
            </div>
            <div className={classes.headingContainer}>
                <h1>
                    <FormattedMessage
                        id={'global.quickOrder'}
                        defaultMessage={'Quick Order'}
                    />
                </h1>
                <p className={classes.description}>
                    <FormattedMessage
                        id={'quickOrder.headerDescription'}
                        defaultMessage={'Order faster with the following 3 steps:'}
                    />
                </p>
                <div className={classes.stepsContainer}>
                    <div className={classes.step}>
                        <span>
                            <FormattedMessage
                                id={'quickOrder.createListOrder'}
                                defaultMessage={'Create order list'}
                            />
                        </span>
                    </div>
                    <div className={classes.step}>
                        <span>
                            <FormattedMessage
                                id={'quickOrder.stepCheckOrderList'}
                                defaultMessage={'Check the list and quantity again'}
                            />
                        </span>
                    </div>
                    <div className={classes.step}>
                        <span>
                            <FormattedMessage
                                id={'addToCartButton.addItemToCartAriaLabel'}
                                defaultMessage={'Add to cart'}
                            />
                        </span>
                    </div>
                </div>
            </div>
            <QuickFormCreate
                classes={classes}
            />
            <ListOrder
                classes={classes}
                data={data}
            />
            <OrderSummary
                classes={classes}
                data={data}
                totalPrice={totalPrice}
                totalCount={data?.getQuickOrder?.items.length || 0}
            />
            <CmsBlock identifiers={'suggest_product'} />
        </div>
    )
}

export default QuickOrder
