import React, { Fragment, useCallback, useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import {Form, Relevant} from 'informed';

import { useWishlistDialog } from '../../../Talons/Wishlist/WishlistDialog/useWishlistDialog';

import Dialog from '@magento/venia-ui/lib/components/Dialog';
import { useStyle } from '@magento/venia-ui/lib/classify';
import FormError from '@magento/venia-ui/lib/components/FormError';

import CreateWishlistForm from '@magento/venia-ui/lib/components/Wishlist/WishlistDialog/CreateWishlistForm';
import WishlistLineItem from '@magento/venia-ui/lib/components/Wishlist/WishlistDialog/WishlistLineItem';

import defaultClasses from '@magento/venia-ui/lib/components/Wishlist/WishlistDialog/wishlistDialog.module.css';
import wishlistDialogClasses from '@magenest/theme/BaseComponents/Wishlist/AddToListButton/wishlistDialog.module.scss';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import Modal from "../../../../@theme/BaseComponents/Modal";
import Select from "../../Select/select";
import Field from "../../Field/field";
import Button from "../../Button/button";
import CreateWishlist from "../../WishlistPage/createWishlist.ee";
import {isRequired} from "../../../Util/formValidators";

const WishlistDialog = props => {
    const { isOpen, itemOptions, onClose, onSuccess, setIsModalOpen, isSearchSuggestion, searchValue } = props;
    const classes = useStyle(defaultClasses, wishlistDialogClasses, props.classes);

    const talonProps = useWishlistDialog({
        isLoading: props.isLoading,
        itemOptions,
        onClose,
        onSuccess,
        setIsModalOpen,
        isSearchSuggestion,
        searchValue
    });

    const {
        formErrors,
        handleAddToWishlist,
        handleCancel,
        wishlistsData,
        setWishlistSelected,
        wishlistSelected,
        isLoading,
        setIsHideAddWishlist,
        isHideAddWishlist
    } = talonProps;

    const { formatMessage } = useIntl();

    const maybeListsElement = useMemo(() => {
        if (wishlistsData) {
            const formattedWistListData = wishlistsData?.customer?.wishlists.map(wishlist => ({
                // If a country is missing the full english name just show the abbreviation.
                label: wishlist.name,
                value: wishlist.id
            }));

            const updatedWishList = [{
                label: formatMessage({
                    id: 'global.chooseWishlist',
                    defaultMessage: 'Choose wishlist'
                }), value: ''
            }, ...formattedWistListData]

            return <Form>
                        <Field
                            id={'wishlist'}
                            label={formatMessage({
                                id: 'global.chooseWishlist',
                                defaultMessage: "Choose wishlist"
                            })}
                            optional={true}
                        >
                            <Select
                                field={'wishlist'}
                                items={updatedWishList}
                                onChange={e => setWishlistSelected(e.target.value)}
                                isEmpty={!wishlistSelected}
                                validate={isRequired}
                                initialValue={wishlistSelected ? wishlistSelected : ''}
                            />
                        </Field>
                        <div className={classes.actions}>
                            <CreateWishlist
                                setIsHideAddWishlist={setIsHideAddWishlist}
                                handleHideAddWishlist={onClose}
                                classes={{root: classes.createWishlist}}
                                priority={'normal'}
                                itemOptions={itemOptions}
                            />
                            <Button disabled={isLoading} type={'submit'} onClick={(e) => handleAddToWishlist(e)} priority={'high'}>
                                <FormattedMessage
                                    id={'global.addToList'}
                                    defaultMessage={'Add to wishlist'}
                                />
                            </Button>
                        </div>
                    </Form>;
        } else {
            return null;
        }
    }, [
        wishlistSelected,
        wishlistsData
    ]);

    return isOpen ? (
        <Modal
            isOpen={isOpen}
            handleClose={handleCancel}
            title={formatMessage({
                id: 'wishlistDialog.title',
                defaultMessage: 'Add to Favorites'
            })}
            classes={{
                innerWidth: classes.modalInnerWidth
            }}
            isHide={isHideAddWishlist}
            isMask={true}
        >
            <div className={classes.root}>
                <FormError
                    classes={{
                        root: classes.formErrors
                    }}
                    errors={formErrors}
                />
                {maybeListsElement}
            </div>
        </Modal>
    ) : null;
};

export default WishlistDialog;

WishlistDialog.propTypes = {
    classes: shape({}),
    isOpen: bool,
    isLoading: bool,
    itemOptions: shape({
        entered_options: arrayOf(
            shape({
                uid: number.isRequired,
                value: string.isRequired
            })
        ),
        parent_sku: string,
        sku: string.isRequired,
        selected_options: arrayOf(string),
        quantity: number.isRequired
    }),
    onClose: func,
    onSuccess: func
};
