import React from 'react';
import defaultClasses from "@magenest/theme/BaseComponents/Header/components/StoreSwitcher/StoreLocation/storeLocationPopup.module.scss";
import { useStyle } from '@magento/venia-ui/lib/classify';
import {FormattedMessage, useIntl} from "react-intl";
import TextInput from "@magento/venia-ui/lib/components/TextInput";
import Field from "@magento/venia-ui/lib/components/Field";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import {Form} from "informed";
import Button from "@magento/venia-ui/lib/components/Button";
import UseStoreLocationPopup from "@magenest/theme/Talons/StoreLocation/useStoreLocationPopup";
import City from "@magenest/theme/BaseComponents/City";
import Ward from "@magenest/theme/BaseComponents/Ward";
import Modal from "@magenest/theme/BaseComponents/Modal";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import { LocationBlue } from "@magenest/theme/static/icons";

const DRAWER_NAME = 'storeLocation';

const StoreLocationPopup = props => {
    const {
        handleClose,
        fetchStoreView,
        handleSubmitLocation,
        storeLocationLabel,
        setStoreLocationLabel,
        isLoading
    } = props;

    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();

    const isOpen = drawer === DRAWER_NAME;

    const { formatMessage } = useIntl();

    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = UseStoreLocationPopup({
        fetchStoreView
    });

    const {
        setStoreLocationValue,
        storeLocationValue,
        handleCurrentLocation,
        setFormApi,
        cityKey,
        wardKey,
        suggestLocation,
        handleSelectSuggestLocation,
        showSuggestLocation,
        setIsChangeAddress,
        addressFieldRef
    } = talonProps;

    return (
        <Modal
            title={formatMessage({
                id: 'storeLocationPopup.header',
                defaultMessage: 'Enter the shipping address'
            })}
            isOpen={isOpen}
            handleClose={handleClose}
            isMask={true}
            zLarge={true}
        >
            <div className={classes.newAdministrativeNote}>
                <FormattedMessage
                    id={'global.newAdministrativeNote'}
                    defaultMessage={'Please enter the address according to the new administrative divisions to ensure correct delivery address.'}
                />
            </div>
            <Form
                data-cy="storeLocationPopup-form"
                onSubmit={handleSubmitLocation}
                getApi={setFormApi}
            >
                <div ref={addressFieldRef}>
                    <Field
                        id="address"
                        optional={true}
                        label={formatMessage({
                            id: 'storeLocationPopup.address',
                            defaultMessage: 'Address'
                        })}
                    >
                        <TextInput
                            field="address"
                            id={'address'}
                            data-cy="storeLocationPopup-address"
                            placeholder={formatMessage({
                                id: 'storeLocationPopup.enterAddress',
                                defaultMessage: 'For example: No. 1 Trang Tien,...'
                            })}
                            mask={value => value && value.trim()}
                            maskOnBlur={true}
                            validate={isRequired}
                            onChange={(e) => {
                                setIsChangeAddress(true);
                                setStoreLocationValue({
                                    ...storeLocationValue,
                                    address: e.target.value
                                })
                            }}
                        />
                        <p className={classes.shareLocation}>
                            <FormattedMessage
                                id={'storeLocationPopup.shareLocationText'}
                                defaultMessage={'* Or share your current location '}
                            />
                            <button type='button' onClick={handleCurrentLocation}>
                                <FormattedMessage
                                    id={'storeLocationPopup.shareLocationButton'}
                                    defaultMessage={'here'}
                                />
                            </button>
                        </p>
                        {
                            showSuggestLocation && suggestLocation.length > 0 && (
                                <div className={classes.suggestLocation}>
                                    <ul>
                                        {
                                            suggestLocation.map((address, index) => (
                                                <li key={index} onClick={() => handleSelectSuggestLocation(address)}>
                                                    <img src={LocationBlue} alt={''} />
                                                    <span>
                                                    {address.address}
                                                </span>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )
                        }
                    </Field>
                </div>
                <City
                    field={'city'}
                    validate={isRequired}
                    data-cy="city"
                    setAddress={setStoreLocationValue}
                    address={storeLocationValue}
                    setAddressLabel={setStoreLocationLabel}
                    optional={true}
                    cityKey={cityKey ? cityKey : ''}
                />
                <Ward
                    field={'ward'}
                    validate={isRequired}
                    data-cy="ward"
                    address={storeLocationValue}
                    setAddress={setStoreLocationValue}
                    setAddressLabel={setStoreLocationLabel}
                    addressLabel={storeLocationLabel}
                    optional={true}
                    wardKey={wardKey ? wardKey : ''}
                />
                <div className={classes.footer}>
                    <Button
                        type={'submit'}
                        priority={'high'}
                        disabled={isLoading}
                    >
                        <FormattedMessage
                            id={'storeLocationPopup.buttonSummit'}
                            defaultMessage={'Save address'}
                        />
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}

export default StoreLocationPopup
