import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { bool, func, shape, string } from 'prop-types';
import { Form } from 'informed';

import {
    displayStates
} from '@magento/peregrine/lib/talons/CheckoutPage/ShippingMethod/useShippingMethod';

import { useShippingMethod } from '../../../Talons/CheckoutPage/ShippingMethod/useShippingMethod'

import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import FormError from '@magento/venia-ui/lib/components/FormError';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import CompletedView from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/completedView';
import ShippingRadios from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/shippingRadios';
import UpdateModal from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/updateModal';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/shippingMethod.module.css';

const initializingContents = (
    <LoadingIndicator>
        <FormattedMessage
            id={'shippingMethod.loading'}
            defaultMessage={'Loading shipping methods...'}
        />
    </LoadingIndicator>
);

const ShippingMethod = props => {
    const {
        deliveryDate,
        setCheckoutStep
    } = props

    const talonProps = useShippingMethod({
        deliveryDate,
        setCheckoutStep
    });

    const {
        displayState,
        errors,
        handleCancelUpdate,
        handleSubmit,
        isLoading,
        isUpdateMode,
        selectedShippingMethod,
        shippingMethods,
        showUpdateMode,
    } = talonProps;

    const classes = useStyle(defaultClasses, props.classes);

    let contents;

    if (displayState === displayStates.DONE) {
        const updateFormInitialValues = {
            shipping_method: selectedShippingMethod.serializedValue
        };

        contents = (
            <Fragment>
                <div className={classes.done} data-cy="ShippingMethod-done">
                    <CompletedView
                        selectedShippingMethod={selectedShippingMethod}
                        showUpdateMode={showUpdateMode}
                    />
                </div>
                <UpdateModal
                    formErrors={Array.from(errors.values())}
                    formInitialValues={updateFormInitialValues}
                    handleCancel={handleCancelUpdate}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    isOpen={isUpdateMode}
                    shippingMethods={shippingMethods}
                />
            </Fragment>
        );
    } else {
        // We're either initializing or editing.
        let bodyContents = initializingContents;

        if (displayState === displayStates.EDITING) {
            const lowestCostShippingMethodSerializedValue = shippingMethods.length
                ? shippingMethods[0].serializedValue
                : '';
            const lowestCostShippingMethod = {
                shipping_method: lowestCostShippingMethodSerializedValue
            };

            bodyContents = (
                <Form
                    className={classes.form}
                    initialValues={lowestCostShippingMethod}
                    onSubmit={handleSubmit}
                >
                    <ShippingRadios
                        disabled={isLoading}
                        shippingMethods={shippingMethods}
                    />
                    <div className={classes.formButtons}>
                        <Button
                            data-cy="ShippingMethod-submitButton"
                            priority="normal"
                            type="submit"
                            disabled={isLoading}
                        >
                            <FormattedMessage
                                id={'shippingMethod.continueToNextStep'}
                                defaultMessage={
                                    'Continue to Payment Information'
                                }
                            />
                        </Button>
                    </div>
                </Form>
            );
        }

        contents = (
            <div data-cy="ShippingMethod-root" className={classes.root}>
                <h3
                    data-cy="ShippingMethod-heading"
                    className={classes.editingHeading}
                >
                    <FormattedMessage
                        id={'shippingMethod.heading'}
                        defaultMessage={'Shipping Method'}
                    />
                </h3>
                <FormError errors={Array.from(errors.values())} />
                {bodyContents}
            </div>
        );
    }

    return <Fragment></Fragment>;
};

ShippingMethod.propTypes = {
    classes: shape({
        done: string,
        editingHeading: string,
        form: string,
        formButtons: string,
        root: string
    })
};

export default ShippingMethod;
