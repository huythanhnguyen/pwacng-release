import React from 'react';
import { arrayOf, shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/card.module.css';
import cardClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/card.module.scss';
import LinkButton from "@magento/venia-ui/lib/components/LinkButton";

const Card = props => {
    const {
        classes: propClasses,
        shippingData,
        handleEditShipping,
        checkoutStep,
        isExportVat,
        deliveryDate,
        vatCompany
    } = props;

    if (!shippingData) return <></>

    const {
        city,
        email,
        firstname,
        ward,
        street,
        telephone
    } = shippingData;

    const originalDate = new Date(String(deliveryDate?.date) || '');
    const formattedDate = originalDate.toLocaleDateString("en-GB");

    const classes = useStyle(defaultClasses, cardClasses, propClasses);

    const nameString = `${firstname}`;
    const additionalAddressString = `${street.join(',')}, ${ward}, ${city}`;

    return (
        <div className={classes.root} data-cy="Card-root">
            {
                checkoutStep === 2 && (
                    <div className={classes.cardHeader}>
                        <div className={`${classes.cardHeadTitle} ${classes.titleNotToggle}`}>
                            <strong>
                                <FormattedMessage
                                    id={'global.deliveryInformation'}
                                    defaultMessage={'Delivery information'}
                                />
                            </strong>
                        </div>
                        <LinkButton
                            onClick={handleEditShipping}
                            className={classes.editButton}
                            data-cy="ShippingInformation-editButton"
                        >
                            <FormattedMessage
                                id={'global.change'}
                                defaultMessage={'Change'}
                            />
                        </LinkButton>
                    </div>
                )
            }
            <div className={classes.container}>
                <div className={classes.block}>
                    <div className={classes.blockTitle}>
                    <span>
                        <FormattedMessage
                            id={'global.customerInformation'}
                            defaultMessage={'Customer information'}
                        />
                    </span>
                    </div>
                    <div className={classes.blockContent}>
                        {
                            checkoutStep === 2 && (
                                <div className={classes.deliveryInformation}>
                                    <div className={classes.blockItem}>
                                        <p className={classes.name}>
                                            <strong>{nameString}</strong>
                                        </p>
                                        <p className={classes.phoneNumber}>
                                            <span className={classes.label}>
                                                <FormattedMessage
                                                    id={'global.telephone'}
                                                    defaultMessage={'Phone number'}
                                                />:
                                            </span>
                                            <span className={classes.value}>
                                                {telephone}
                                            </span>
                                        </p>
                                        <p>
                                            <span className={classes.label}>
                                                <FormattedMessage
                                                    id={'global.email'}
                                                    defaultMessage={'Email'}
                                                />:
                                            </span>
                                            <span className={classes.value}>
                                                {email}
                                            </span>
                                        </p>
                                    </div>
                                    <div className={classes.blockItem}>
                                        <p className={classes.labelSpacing}>
                                            <FormattedMessage
                                                id={'global.deliveryAddress'}
                                                defaultMessage={'Delivery address'}
                                            />
                                        </p>
                                        <p className={classes.vatValue}>
                                            {additionalAddressString}
                                        </p>
                                    </div>
                                    <div className={classes.blockItem}>
                                        <p className={classes.labelSpacing}>
                                            <FormattedMessage
                                                id={'global.deliveryTime'}
                                                defaultMessage={'Delivery time'}
                                            />
                                        </p>
                                        <p className={classes.vatValue}>
                                            <FormattedMessage
                                                id={'global.deliveryTimeCurrent'}
                                                defaultMessage={'Date: {date}. Time: From {from}:00 to {to}:00'}
                                                values={{
                                                    date: formattedDate,
                                                    from: deliveryDate.from / 60,
                                                    to: deliveryDate.to / 60
                                                }}
                                            />
                                        </p>
                                    </div>
                                    {
                                        deliveryDate.comment && (
                                            <div className={classes.blockItem}>
                                                <p className={classes.labelSpacing}>
                                                    <FormattedMessage
                                                        id={'global.note'}
                                                        defaultMessage={'Note'}
                                                    />
                                                </p>
                                                <p className={classes.vatValue}>
                                                    {deliveryDate.comment}
                                                </p>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
                {
                    checkoutStep === 2 && isExportVat && vatCompany && (
                        <div className={classes.block}>
                            <div className={classes.blockTitle}>
                                <span>
                                    <FormattedMessage
                                        id={'global.vatInvoiceInformation'}
                                        defaultMessage={'VAT invoice information'}
                                    />
                                </span>
                            </div>
                            <div className={classes.deliveryInformation}>
                                <div className={classes.blockContent}>
                                    <div className={classes.blockItem}>
                                        <p className={classes.vatLabel}>
                                            <FormattedMessage
                                                id={'global.companyName'}
                                                defaultMessage={'Company name'}
                                            />
                                        </p>
                                        <p className={classes.vatValue}>
                                            {vatCompany.company_name}
                                        </p>
                                    </div>
                                    <div className={classes.blockItem}>
                                        <p className={classes.vatLabel}>
                                            <FormattedMessage
                                                id={'global.address'}
                                                defaultMessage={'Address'}
                                            />
                                        </p>
                                        <p className={classes.vatValue}>
                                            {vatCompany.company_address}
                                        </p>
                                    </div>
                                    <div className={classes.blockItem}>
                                        <p className={classes.vatLabel}>
                                            <FormattedMessage
                                                id={'global.companyTaxCode'}
                                                defaultMessage={'Company tax code'}
                                            />
                                        </p>
                                        <p className={classes.vatValue}>
                                            {vatCompany.company_vat_number}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default Card;

Card.propTypes = {
    classes: shape({
        root: string,
        address: string,
        area: string
    }),
    shippingData: shape({
        city: string.isRequired,
        country: shape({
            label: string.isRequired
        }).isRequired,
        email: string.isRequired,
        firstname: string.isRequired,
        street: arrayOf(string).isRequired,
        telephone: string.isRequired
    }).isRequired
};
