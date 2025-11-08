import React, { Fragment, Suspense, useRef } from 'react';
import { element, func, shape, string } from 'prop-types';
import { Heart } from 'react-feather';
import { useAddToListButton } from '../../../Talons/Wishlist/AddToListButton/useAddToListButton.ee';
import { useButton } from 'react-aria';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon';
import WishlistDialog from '../WishlistDialog/wishlistDialog';
import defaultClasses from '@magento/venia-ui/lib/components/Wishlist/AddToListButton/addToListButton.module.css';
import addToListButtonClasses from '@magenest/theme/BaseComponents/Wishlist/AddToListButton/addToListButton.module.scss';
import { useCommonToasts } from '@magento/venia-ui/lib/components/Wishlist/AddToListButton/useCommonToasts';
import CreateWishlist from "../../WishlistPage/createWishlist.ee";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {Link} from "react-router-dom";

const HeartIcon = <Icon size={20} src={Heart} />;

const AddToListButton = props => {
    const {
        isSearchSuggestion = false,
        searchValue
    } = props;

    const buttonRef = useRef();
    const talonProps = useAddToListButton(props);
    const {
        buttonProps,
        buttonText,
        errorToastProps,
        isSelected,
        loginToastProps,
        modalProps,
        successToastProps,
        setIsModalOpen,
        handleRemoveProductFromWishlist
    } = talonProps;

    useCommonToasts({ errorToastProps, loginToastProps });
    const { buttonProps: buttonAriaProps } = useButton(buttonProps, buttonRef);
    const [{ isSignedIn }] = useUserContext();

    const multipleWishlistDialog = modalProps ? (
        <WishlistDialog setIsModalOpen={setIsModalOpen} {...modalProps} isSearchSuggestion={isSearchSuggestion} searchValue={searchValue} />
    ) : null;

    const classes = useStyle(defaultClasses, addToListButtonClasses, props.classes);
    const buttonClass = isSelected ? classes.root_selected : classes.root;

    const currentPage = btoa(window.location.pathname);

    return (
        <Fragment>
            {
                isSignedIn ? (
                    isSelected ? (
                        <button
                            className={classes.root_selected}
                            title={buttonText || 'Added to Favorites'}
                            onClick={handleRemoveProductFromWishlist}
                            data-cy="addToListButton-root"
                            type='button'
                        >
                            {props.icon} {buttonText}
                        </button>
                    ) : (
                        <>
                            <button
                                ref={buttonRef}
                                className={buttonClass}
                                title={buttonText || 'Add to Favorites'}
                                {...buttonAriaProps}
                                data-cy="addToListButton-root"
                            >
                                {props.icon} {buttonText}
                            </button>
                            {multipleWishlistDialog}
                        </>
                    )
                ) : (
                    <Link
                        to={`/sign-in?referer=${currentPage}`}
                        className={buttonClass}
                        aria-label={buttonText || 'Add to Favorites'}
                    ><span>{buttonText}</span></Link>
                )
            }
        </Fragment>
    );
};

export default AddToListButton;

AddToListButton.defaultProps = {
    icon: HeartIcon
};

AddToListButton.propTypes = {
    afterAdd: func,
    beforeAdd: func,
    classes: shape({
        root: string,
        root_selected: string
    }),
    icon: element
};
