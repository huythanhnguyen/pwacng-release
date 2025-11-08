import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import Dialog from '@magento/venia-ui/lib/components/Dialog';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import defaultClasses from '@magenest/theme/BaseComponents/AddressBookPage/extendStyle/addressCard.module.scss';
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";

const AddressCard = props => {
    const {
        address,
        classes: propClasses,
        countryName,
        isConfirmingDelete,
        isDeletingCustomerAddress,
        onCancelDelete,
        onConfirmDelete,
        onEdit,
        onDelete
    } = props;

    const {
        firstname,
        telephone,
        default_shipping,
        is_new_administrative,
        city,
        street,
        custom_attributes
    } = address;

    const district = custom_attributes?.find(attr => attr.attribute_code === 'district')?.value || '';
    const ward = custom_attributes?.find(attr => attr.attribute_code === 'ward')?.value || '';

    const additionalAddressString = `${ward !== '' ? ', ' + ward : ''}${!is_new_administrative ? `, ${district}` : ''}${city !== '' ? ', ' + city : ''}`;

    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, propClasses);

    const streetRows = street.map((row, index) => {
        return (
            <span className={classes.streetRow} key={index}>
                {row}
            </span>
        );
    });

    const defaultBadge = default_shipping ? (
        <span
            className={classes.defaultBadge}
            data-cy="addressCard-defaultBadge"
        >
            <FormattedMessage
                id={'addressCard.defaultText'}
                defaultMessage={'Default'}
            />
        </span>
    ) : null;

    const deleteButtonElement = !default_shipping ? (
        <Button
            type="button" priority="normal"
            className={classes.deleteButton}
            onClick={onDelete}
            data-cy="addressCard-deleteButton"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.22413 2.34684C4.22413 2.35633 4.22431 2.36579 4.22468 2.37522H1.46979C0.9178 2.37522 0.46875 2.78371 0.46875 3.28576V4.27425C0.46875 4.7764 0.917801 5.18496 1.46979 5.18496H2.34458V14.4852C2.34458 15.0241 2.84914 15.5 3.40117 15.5H11.6298C12.1818 15.5 12.6429 15.0241 12.6428 14.4852V5.18496H13.5227C14.0748 5.18496 14.5238 4.7764 14.5238 4.27425V3.28576C14.5238 2.78371 14.0748 2.37522 13.5227 2.37522H10.771C10.772 2.36579 10.7725 2.35633 10.7725 2.34684V1.41054C10.7725 0.908488 10.3234 0.5 9.7714 0.5H5.29421C4.74213 0.5 4.22413 0.908488 4.22413 1.41054V2.34684ZM9.84466 2.34381V1.43764H5.15771V2.34382H9.84466V2.34381ZM3.27816 5.18496H11.7079V14.4852C11.7079 14.5145 11.6526 14.5683 11.5624 14.5683H3.42367C3.33346 14.5683 3.27816 14.5145 3.27816 14.4852V5.18496ZM13.5796 4.24842H1.40415V3.30568H13.5796V4.24842ZM6.09008 7.05915H5.15239V12.6811H6.09008V7.05915ZM7.03078 7.05915H7.96847V12.6811H7.03078V7.05915ZM9.84162 7.05915H8.90393V12.6811H9.84162V7.05915Z" fill="#0272BA"/>
            </svg>
            <span className={classes.actionLabel}>
                <FormattedMessage
                    id="addressBookPage.deleteAddress"
                    defaultMessage="Delete"
                />
            </span>
        </Button>
    ) : null;

    const setScrollLock = false

    const maybeConfirmingDeleteOverlay = isConfirmingDelete ? (
        <Dialog
            isOpen={isConfirmingDelete}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
            setScrollLock={setScrollLock}
            title={formatMessage({ id: 'addressCard.confirmDelete', defaultMessage: 'Delete Address' })}
        >
            <div className={classes.confirmDeleteContainer}>
                <FormattedMessage
                    id={'addressCard.confirmDeleteText'}
                    defaultMessage={'Are you sure you want to delete this address?'}
                />
            </div>
        </Dialog>
    ) : null;

    return (
        <div className={classes.root} data-cy="addressCard-root">
            <div
                className={classes.contentContainer}
                data-cy="addressCard-contentContainer"
            >
                {defaultBadge}
                <span className={classes.name}>{`${firstname} - ${telephone}`}</span>
                <p className={classes.address}>
                    {streetRows}{additionalAddressString}
                </p>
                {!is_new_administrative && (
                    <p className={classes.note}>
                        <FormattedMessage
                            id={'global.newAdministrativeDivisions'}
                            defaultMessage={'Please update the shipping address according to the new administrative divisions.'}
                        />
                    </p>
                )}
            </div>
            <div className={classes.actionContainer}>
                {deleteButtonElement}
                {maybeConfirmingDeleteOverlay}
                <Button
                    type="button" priority="normal"
                    className={classes.editButton}
                    onClick={onEdit}
                    data-cy="addressCard-editButton"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M5.4535 8.8361C5.44351 8.84882 5.43352 8.86222 5.42903 8.87834L4.65786 11.7057C4.61289 11.8703 4.65895 12.0477 4.78081 12.1727C4.87196 12.2618 4.99205 12.3107 5.11996 12.3107C5.1622 12.3107 5.20452 12.3056 5.24618 12.2946L8.05346 11.5289C8.05797 11.5289 8.06014 11.5328 8.06354 11.5328C8.09579 11.5328 8.12747 11.5211 8.15139 11.4967L15.6582 3.99098C15.8811 3.76771 16.0034 3.46358 16.0034 3.13268C16.0034 2.75773 15.8444 2.38294 15.5659 2.1052L14.857 1.39512C14.5789 1.11663 14.2036 0.957318 13.8288 0.957318C13.498 0.957318 13.1939 1.07962 12.9703 1.30232L5.46467 8.81C5.45687 8.81716 5.45907 8.82777 5.4535 8.8361ZM14.9236 3.2559L14.178 4.00097L12.9692 2.77303L13.7043 2.03795C13.8205 1.92117 14.0457 1.9382 14.1791 2.07214L14.8886 2.78222C14.9626 2.85613 15.0048 2.95453 15.0048 3.05183C15.0043 3.13158 14.9759 3.20395 14.9236 3.2559ZM6.78852 8.95403L12.2053 3.53696L13.4146 4.76572L8.00795 10.1722L6.78852 8.95403ZM5.80162 11.1502L6.19307 9.71345L7.23722 10.7577L5.80162 11.1502ZM14.9878 6.23028C14.7037 6.23028 14.4535 6.46131 14.4524 6.74932V13.7728C14.4524 14.1398 14.1544 14.4244 13.7869 14.4244H2.24062C1.87365 14.4244 1.60013 14.1398 1.60013 13.7728V2.21405C1.60013 1.8468 1.87363 1.5703 2.24062 1.5703H10.1646C10.4504 1.5703 10.6822 1.31638 10.6822 1.03054C10.6822 0.745273 10.4503 0.5 10.1646 0.5H2.16166C1.267 0.5 0.523438 1.24044 0.523438 2.13563V13.8518C0.523438 14.747 1.26702 15.5 2.16166 15.5H13.8652C14.7605 15.5 15.5225 14.747 15.5225 13.8518V6.74605C15.5214 6.46131 15.2719 6.23028 14.9878 6.23028Z" fill="#0272BA"/>
                    </svg>
                    <span className={classes.actionLabel}>
                        <FormattedMessage
                            id="addressBookPage.editAddress"
                            defaultMessage="Edit"
                        />
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default AddressCard;

AddressCard.propTypes = {
    address: shape({
        firstname: string,
        telephone: string,
        default_shipping: bool,
        city: string,
        street: arrayOf(string)
    }).isRequired,
    classes: shape({
        actionContainer: string,
        actionLabel: string,
        additionalAddress: string,
        contentContainer: string,
        country: string,
        defaultBadge: string,
        defaultCard: string,
        deleteButton: string,
        editButton: string,
        flash: string,
        linkButton: string,
        name: string,
        root: string,
        root_updated: string,
        streetRow: string,
        telephone: string,
        confirmDeleteContainer: string
    }),
    countryName: string,
    isConfirmingDelete: bool,
    isDeletingCustomerAddress: bool,
    onCancelDelete: func,
    onConfirmDelete: func,
    onDelete: func,
    onEdit: func
};
