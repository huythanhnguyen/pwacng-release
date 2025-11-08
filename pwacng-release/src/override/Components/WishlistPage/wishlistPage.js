import React, {Fragment, useEffect, useMemo, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useWishlistPage } from '../../Talons/WishlistPage/useWishlistPage';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';
import Wishlist from './wishlist';
import defaultClasses from '@magenest/theme/BaseComponents/WishlistPage/extendStyle/wishlistPage.module.scss';
import accountClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/account.module.scss';
import CreateWishlist from './createWishlist.ee';
import MyAccountLayout from "../MyAccount/myAccountLayout";
import Modal from "../../../@theme/BaseComponents/Modal";
import {Form} from "informed";
import Field from "../Field/field";
import TextInput from "../TextInput/textInput";
import {isRequired} from "../../Util/formValidators";
import Button from "@magento/venia-ui/lib/components/Button";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import Gallery from "../Gallery/gallery";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const WishlistPage = props => {
    const talonProps = useWishlistPage();
    const {
        errors,
        loading,
        fetchLoading,
        wishlists,
        wishlistSelected,
        setWishlistSelected,
        handleRename,
        handleDelete,
        handleRenameModalClose,
        handleDeleteModalClose,
        renameModalOpen,
        deleteModalOpen,
        handleRenameSubmit,
        setFormApi,
        handleDeleteWishlist,
        relatedProducts
    } = talonProps;
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const [isOpenSidebar, setIsOpenSidebar] = useState(false);
    const { isMobile } = useMediaCheck();
    const classes = useStyle(defaultClasses, accountClasses, props.classes);
    const WISHLIST_DISABLED_MESSAGE = formatMessage({
        id: 'wishlistPage.wishlistDisabledMessage',
        defaultMessage: 'The wishlist is not currently available.'
    });
    const relatedProductsClasses = relatedProducts?.length < 4 ? (' productsLength' + relatedProducts?.length) : '';

    const [openedWishlistId, setOpenedWishlistId] = useState(null);

    const wishlistElements = useMemo(() => {
        if (wishlists.length === 0) {
            return <Wishlist />;
        }

        return wishlists.map((wishlist, index) => (
            <Wishlist
                idDefault={wishlists[0].id === wishlist.id}
                key={wishlist.id}
                isCollapsed={index !== 0}
                data={wishlist}
                setWishlistSelected={setWishlistSelected}
                handleRename={handleRename}
                handleDelete={handleDelete}
                isLoading={loading}
                openedWishlistId={openedWishlistId}
                setOpenedWishlistId={setOpenedWishlistId}
            />
        ));
    }, [wishlists, openedWishlistId]);

    useEffect(() => {
        if (errors) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errors.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [errors]);

    if (loading) {
        return fullPageLoadingIndicator;
    }

    const content = (
        <Fragment>
            {wishlistElements}
            {
                relatedProducts?.length > 0 && (
                    <div className={classes.relatedProduct + relatedProductsClasses}>
                        <div className={classes.title}>
                            <strong>
                                <FormattedMessage
                                    id={'global.recommendedProduct'}
                                    defaultMessage={'Recommended products'}
                                />
                            </strong>
                        </div>
                        <div className={classes.productsGallery}>
                            <Gallery
                                items={relatedProducts}
                                isSlider={true}
                                slideToShow={5}
                                sliderConfig={[
                                    {
                                        breakpoint: 1440,
                                        settings: {
                                            slidesToShow: 4,
                                            slidesToScroll: 4
                                        }
                                    },
                                    {
                                        breakpoint: 1200,
                                        settings: {
                                            slidesToShow: 3,
                                            slidesToScroll: 3
                                        }
                                    },
                                    {
                                        breakpoint: 1023,
                                        settings: {
                                            slidesToShow: 2,
                                            slidesToScroll: 2
                                        }
                                    },
                                    {
                                        breakpoint: 768,
                                        settings: "unslick"
                                    }
                                ]}
                            />
                        </div>
                    </div>
                )
            }
        </Fragment>
    )

    const wishlistName = wishlistSelected?.name ? (
        <strong className={classes.name} data-cy="Wishlist-name" title={name}>
            {wishlistSelected.name}
            <span className={classes.count}>({wishlistSelected.itemsCount})</span>
        </strong>
    ) : (
        <strong className={classes.name}>
            {
                wishlistSelected.itemsCount && (
                    <FormattedMessage
                        id={'global.defaultWishlistName'}
                        defaultMessage={'Default wishlist <highlight>{wishlistSelected.itemsCount}</highlight>'}
                        values={{
                            highlight: chunks => (
                                <span className={classes.count}>({chunks})</span>
                            ),
                            itemsCount: wishlistSelected.itemsCount
                        }}
                    />
                )
            }
        </strong>
    );

    return (
        <MyAccountLayout currentPage={'wishList'} isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar}>
            <h2 className={classes.currentPageTitle}>
                <button className={classes.backButton} onClick={() => setIsOpenSidebar(true)}>
                    <span>{'<'}</span>
                </button>
                <span>
                    <FormattedMessage
                        id={'global.wishlist'}
                        defaultMessage={'My Items'}
                    />
                </span>
                {
                    !isMobile && (
                        <div className={classes.createWishlist}>
                            <CreateWishlist priority={'high'}/>
                        </div>
                    )
                }
            </h2>
            {
                isMobile && (
                    <div className={classes.createWishlist}>
                        <CreateWishlist priority={'high'}/>
                    </div>
                )
            }
            {content}
            <Modal
                isOpen={renameModalOpen}
                handleClose={handleRenameModalClose}
                title={formatMessage({
                    id: 'global.renameWishlist',
                    defaultMessage: 'Rename wishlist'
                })}
            >
                <div className={classes.modal}>
                    {wishlistName}
                    <Form onSubmit={handleRenameSubmit} getApi={setFormApi}>
                        <Field
                            id={'new_name'}
                            label={formatMessage({
                                id: 'global.renameField',
                                defaultMessage: 'Enter the name of the wishlist'
                            })}
                            optional={true}
                        >
                            <TextInput
                                field={'new_name'}
                                placeholder={formatMessage({
                                    id: 'global.renameField',
                                    defaultMessage: 'Enter the name of the wishlist'
                                })}
                                id="new_name"
                                validate={isRequired}
                            />
                        </Field>
                        <Button disabled={fetchLoading} priority={'high'} type={'submit'}>
                            <FormattedMessage
                                id={'createWishlist.save'}
                                defaultMessage={'Save'}
                            />
                        </Button>
                    </Form>
                </div>
            </Modal>
            <Modal
                isOpen={deleteModalOpen}
                handleClose={handleDeleteModalClose}
                title={formatMessage({
                    id: 'global.deleteWishlistTitle',
                    defaultMessage: 'Delete wishlist'
                })}
            >
                <div className={classes.modal}>
                    {wishlistName}
                    <p className={classes.description}>
                        <FormattedMessage
                            id={'global.deleteWishlistDescription'}
                            defaultMessage={'When this list is deleted, all products in the list will also be removed.'}
                        />
                    </p>
                    <div className={classes.actionsWrapper}>
                        <Button disabled={fetchLoading} onClick={handleDeleteModalClose} type={'button'} priority={'normal'}>
                            <FormattedMessage
                                id={'global.cancel'}
                                defaultMessage={'Cancel'}
                            />
                        </Button>
                        <Button disabled={fetchLoading} onClick={handleDeleteWishlist} type={'button'} priority={'high'}>
                            <FormattedMessage
                                id={'global.confirmDelete'}
                                defaultMessage={'Confirm delete'}
                            />
                        </Button>
                    </div>
                </div>
            </Modal>
        </MyAccountLayout>
    );
};

export default WishlistPage;
