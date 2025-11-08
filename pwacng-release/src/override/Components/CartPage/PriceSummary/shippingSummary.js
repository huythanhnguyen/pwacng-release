import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Price from '@magento/venia-ui/lib/components/Price';
import { QuestionCircle } from '@magenest/theme/static/icons';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Modal from "../../../../@theme/BaseComponents/Modal";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import CmsBlock from "../../CmsBlock/cmsBlock";
import Button from "../../Button/button";
const DRAWER_NAME = 'shippingModal'
/**
 * A component that renders the shipping summary line item after address and
 * method are selected
 *
 * @param {Object} props.classes
 * @param {Object} props.data fragment response data
 */
const ShippingSummary = props => {
    const classes = useStyle({}, props.classes);
    const { data, isCheckout, checkoutStep } = props;
    const { formatMessage } = useIntl();

    const shipping = data[0]?.selected_shipping_method?.amount;
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();

    const isOpen = drawer === DRAWER_NAME;

    // For a value of "0", display "FREE".
    const price = shipping?.value ? (
        <Price value={shipping?.value} currencyCode={shipping?.currency} />
    ) : (
        <span>
            <FormattedMessage id={'global.free'} defaultMessage={'FREE'} />
        </span>
    );

    return (
        <>
            <span className={classes.lineItemLabel}>
                <FormattedMessage
                    id={'global.shippingFee'}
                    defaultMessage={'Shipping fee'}
                />
                {
                    data[0]?.selected_shipping_method?.method_title && checkoutStep === 2 && (
                        <>
                            <span className={classes.distance}>
                                <FormattedMessage
                                    id={'global.distanceOf'}
                                    defaultMessage={'Distance of {value}'}
                                    values={{
                                        value: data[0].selected_shipping_method.method_title
                                    }}
                                />
                                <span className={classes.distanceIcon} onClick={() => toggleDrawer(DRAWER_NAME)}>
                                    <img src={QuestionCircle} alt={''} />
                                </span>
                            </span>
                            <Modal
                                title={formatMessage({
                                    id: 'global.notification',
                                    defaultMessage: 'Notification'
                                })}
                                isOpen={isOpen}
                                handleClose={() => closeDrawer(DRAWER_NAME)}
                                classes={classes}
                            >
                                <div className={classes.shippingNoteModal}>
                                    <CmsBlock identifiers={'shipping-note'} />
                                    <p>
                                        <FormattedMessage
                                            id={'global.forMoreDetails'}
                                            defaultMessage={'For more details, please '}
                                        />
                                        <a target={'_blank'} href={'/'}>
                                            <FormattedMessage
                                                id={'global.seeHere'}
                                                defaultMessage={'See here'}
                                            />
                                        </a>
                                    </p>
                                    <Button onClick={() => closeDrawer(DRAWER_NAME)} priority={'high'}>
                                        <FormattedMessage
                                            id={'global.gotIt'}
                                            defaultMessage={'Got it'}
                                        />
                                    </Button>
                                </div>
                            </Modal>
                        </>
                    )
                }
            </span>
            {
                isCheckout && checkoutStep === 2 ? (
                    !data.length || !data[0].selected_shipping_method ? (
                        <span
                            data-cy="ShippingSummary-shippingValue"
                            className={classes.price}
                        >
                        <FormattedMessage
                            id={'global.notCountedYet'}
                            defaultMessage={'Not counted yet'}
                        />
                    </span>
                    ) : (
                        <span
                            data-cy="ShippingSummary-shippingValue"
                            className={classes.price}
                        >
                        {price}
                    </span>
                    )
                ) : (
                    <span
                        data-cy="ShippingSummary-shippingValue"
                        className={classes.price}
                    >
                        <FormattedMessage
                            id={'global.notCountedYet'}
                            defaultMessage={'Not counted yet'}
                        />
                    </span>
                )
            }
        </>
    );
};

export default ShippingSummary;
