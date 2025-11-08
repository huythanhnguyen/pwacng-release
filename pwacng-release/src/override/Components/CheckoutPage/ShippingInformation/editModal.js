import React from 'react';
import { FormattedMessage } from 'react-intl';
import { object, shape, string } from 'prop-types';
import { useEditModal } from '@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/useEditModal';

import { useStyle } from '@magento/venia-ui/lib/classify';
import CustomerForm from './AddressForm/customerForm';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/editModal.module.css';
import editModalClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/editModal.module.scss';
import Modal from "../../../../@theme/BaseComponents/Modal";

const EditModal = props => {
    const { classes: propClasses, shippingData, setSelectedAddress, setSelectedAddressId } = props;
    const talonProps = useEditModal();
    const { handleClose, isOpen } = talonProps;

    const classes = useStyle(defaultClasses, editModalClasses, propClasses);
    const rootClass = isOpen ? classes.root_open : classes.root;

    // Unmount the form to force a reset back to original values on close
    const bodyElement = isOpen ? (
        <CustomerForm
            afterSubmit={handleClose}
            onCancel={handleClose}
            shippingData={shippingData}
            setSelectedAddress={setSelectedAddress}
            setSelectedAddressId={setSelectedAddressId}
        />
    ) : null;

    return (
        <Modal
            handleClose={handleClose}
            isOpen={isOpen}
            title={shippingData ?
                    <FormattedMessage
                        id={'global.editShippingAddress'}
                        defaultMessage={'Edit shipping address'}
                    /> :
                    <FormattedMessage
                        id={'global.addShippingAddress'}
                        defaultMessage={'Add shipping address'}
                    />}
        >
            {bodyElement}
        </Modal>
    );
};

export default EditModal;

EditModal.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        body: string,
        header: string,
        headerText: string
    }),
    shippingData: object
};
