 import React from 'react';
import { FormattedMessage } from 'react-intl';
import { shape, string, bool, func, arrayOf } from 'prop-types';
import { useAddressCard } from '../../../Talons/CheckoutPage/AddressBook/useAddressCard';
import { EditSquare } from '@magenest/theme/static/icons';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/AddressBook/addressCard.module.css';
import addressCard from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/addressCard.module.scss';

const AddressCard = props => {
    const {
        address,
        classes: propClasses,
        isSelected,
        onEdit,
        onSelection,
        selectedAddress
    } = props;

    const talonProps = useAddressCard({
        address,
        onEdit,
        onSelection,
        selectedAddress
    });
    const {
        handleClick,
        handleEditAddress,
        handleKeyPress,
        hasUpdate
    } = talonProps;

    const {
        city,
        default_shipping,
        is_new_administrative,
        firstname,
        street,
        telephone,
        custom_attributes
    } = address;

    const streetRows = street.map((row, index) => {
        return <span key={index}>{row}</span>;
    });

    const district = custom_attributes?.find(item => item.attribute_code === 'district')?.value || '';
    const ward = custom_attributes?.find(item => item.attribute_code === 'ward')?.value || '';

    const classes = useStyle(defaultClasses, addressCard, propClasses);

    const rootClass = isSelected
        ? hasUpdate
            ? classes.root_updated
            : classes.root_selected
        : classes.root;

    const editButton = isSelected ? (
        <button className={classes.editButton} onClick={handleEditAddress}>
            <img src={EditSquare} alt={''} />
            <FormattedMessage
                id={'global.edit'}
                defaultMessage={'Edit'}
            />
        </button>
    ) : null;

    const defaultBadge = default_shipping ? (
        <span className={classes.defaultBadge}>
            <FormattedMessage
                id={'global.defaultText'}
                defaultMessage={'Default'}
            />
        </span>
    ) : null;

    const nameString = `${firstname}`;
    const additionalAddressString = `${ward}, ${!is_new_administrative ? `${district}, ` : ''}${city}`;

    return (
        <div
            className={is_new_administrative ? rootClass : `${classes.disabled} ${classes.root}`}
            onClick={is_new_administrative ? handleClick: () => {}}
            onKeyPress={is_new_administrative ? handleKeyPress : () => {}}
            role="button"
            tabIndex="0"
        >
            <div className={classes.details}>
                {defaultBadge}
                <strong className={classes.name}>
                    <span className={classes.radio}></span>
                    {nameString} - {telephone}
                </strong>
                <span className={classes.address}>{streetRows}, {additionalAddressString}</span>
                {!is_new_administrative && (
                    <p className={classes.note}>
                        <FormattedMessage
                            id={'global.newAdministrativeDivisions'}
                            defaultMessage={'Please update the shipping address according to the new administrative divisions.'}
                        />
                    </p>
                )}
            </div>
            {/*{editButton}*/}
        </div>
    );
};

export default AddressCard;

AddressCard.propTypes = {
    address: shape({
        city: string,
        country_code: string,
        default_shipping: bool,
        firstname: string,
        postcode: string,
        region: shape({
            region_code: string,
            region: string
        }),
        street: arrayOf(string)
    }).isRequired,
    classes: shape({
        root: string,
        root_selected: string,
        root_updated: string,
        editButton: string,
        editIcon: string,
        defaultBadge: string,
        name: string,
        address: string
    }),
    isSelected: bool.isRequired,
    onEdit: func.isRequired,
    onSelection: func.isRequired
};
