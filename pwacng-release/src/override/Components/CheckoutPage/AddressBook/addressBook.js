import React, { Fragment, useEffect, useMemo, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { shape, string, func } from 'prop-types';
import { PlusSquare, AlertCircle as AlertCircleIcon } from 'react-feather';
import { useToasts } from '@magento/peregrine';
import { useAddressBook } from '../../../Talons/CheckoutPage/AddressBook/useAddressBook';
import { PlusCircle } from '@magenest/theme/static/icons';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/AddressBook/addressBook.module.css';
import addressBookClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/addressBook.module.scss';
import AddressCard from './addressCard.js';
import Icon from '@magento/venia-ui/lib/components/Icon';
import LinkButton from '@magento/venia-ui/lib/components/LinkButton';

const EditModal = React.lazy(() => import('../ShippingInformation/editModal'));

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const AddressBook = props => {
    const {
        setSelectedAddressId,
        shippingData,
        setSelectedAddress,
        selectedAddress
    } = props;

    const talonProps = useAddressBook({
        setSelectedAddressId,
        shippingData,
        setSelectedAddress
    });

    const {
        activeAddress,
        customerAddresses,
        errorMessage,
        handleAddAddress,
        handleEditAddress,
        handleSelectAddress
    } = talonProps;

    const classes = useStyle(defaultClasses, addressBookClasses, props.classes);

    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (errorMessage) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorMessage,
                dismissable: true,
                timeout: 10000
            });
        }
    }, [addToast, errorMessage]);

    const addAddressButton = useMemo(
        () => (
            <LinkButton
                className={classes.addButton}
                key="addAddressButton"
                onClick={handleAddAddress}
            >
                <FormattedMessage
                    id={'addressBook.addNewAddresstext'}
                    defaultMessage={'Add New Address'}
                />
                <img src={PlusCircle} alt={''} />
            </LinkButton>
        ),
        [classes.addButton, classes.addIcon, classes.addText, handleAddAddress]
    );

    const addressElements = useMemo(() => {
        let defaultIndex;
        const addresses = customerAddresses.map((address, index) => {
            const isSelected = selectedAddress === address.id;

            if (address.default_shipping) {
                defaultIndex = index;
            }

            return (
                <AddressCard
                    address={address}
                    isSelected={isSelected}
                    key={address.id}
                    onSelection={handleSelectAddress}
                    onEdit={handleEditAddress}
                />
            );
        });

        // Position the default address first in the elements list
        if (defaultIndex) {
            [addresses[0], addresses[defaultIndex]] = [
                addresses[defaultIndex],
                addresses[0]
            ];
        }

        return [...addresses];
    }, [
        customerAddresses,
        handleEditAddress,
        handleSelectAddress,
        selectedAddress
    ]);

    return (
        <Fragment>
            <div className={classes.root}>
                <div className={classes.blockTitle}>
                    <strong>
                        <FormattedMessage
                            id={'global.shippingInformation'}
                            defaultMessage={'Shipping Information'}
                        />
                    </strong>
                    {addAddressButton}
                </div>
                <div className={classes.content}>{addressElements}</div>
            </div>
            <Suspense fallback={null}>
                <EditModal
                    shippingData={activeAddress}
                    setSelectedAddress={setSelectedAddress}
                    setSelectedAddressId={setSelectedAddressId}
                />
            </Suspense>
        </Fragment>
    );
};

export default AddressBook;

AddressBook.propTypes = {
    classes: shape({
        root: string,
        root_active: string,
        headerText: string,
        buttonContainer: string,
        content: string,
        addButton: string,
        addIcon: string,
        addText: string
    })
};
