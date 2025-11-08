import React from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { PlusSquare } from 'react-feather';

import { useCreateWishlist } from '../../Talons/WishlistPage/useCreateWishlist';

import Dialog from '@magento/venia-ui/lib/components/Dialog';
import Field from '../Field/field';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { isRequired } from '../../Util/formValidators';
import { useStyle } from '@magento/venia-ui/lib/classify';

import TextInput from '../TextInput/textInput';
import FormError from '@magento/venia-ui/lib/components/FormError/formError';

import defaultClasses from '@magento/venia-ui/lib/components/WishlistPage/createWishlist.module.css';
import createWishlistClasses from '@magenest/theme/BaseComponents/WishlistPage/extendStyle/createWishlist.module.scss';
import Button from "../Button/button";
import Modal from "../../../@theme/BaseComponents/Modal";
import {Form} from "informed";

const CreateWishlist = props => {
    const classes = useStyle(defaultClasses, createWishlistClasses, props.classes);

    const {
        priority,
        setIsHideAddWishlist,
        handleHideAddWishlist,
        itemOptions = null
    } = props;

    const talonProps = useCreateWishlist({
        setIsHideAddWishlist,
        handleHideAddWishlist,
        itemOptions
    });
    const {
        formErrors,
        handleCreateList,
        handleHideModal,
        handleShowModal,
        loading,
        showCreateWishlist,
        setFormApi,
        showModalWarning,
        handleCloseMaximumModal,
        setWishlistName
    } = talonProps;

    const { formatMessage } = useIntl();

    return <div className={classes.root}>
        <Button
            priority={priority}
            onClick={handleShowModal}
            type="button"
            data-cy="createWishlist-createButton"
        >
            <FormattedMessage
                id={'createWishlist.handleCreateListText'}
                defaultMessage={'Create a wishlist'}
            />
        </Button>
        {
            showCreateWishlist && (
                <Modal
                    isOpen={showCreateWishlist}
                    handleClose={handleHideModal}
                    title={formatMessage({
                        id: 'createWishlist.handleCreateListText',
                        defaultMessage: 'Create a wishlist'
                    })}
                    shouldDisableConfirmButton={loading}
                    classes={{
                        innerWidth: classes.modalInnerWidth
                    }}
                    isMask={true}
                >
                    <FormError
                        classes={{
                            root: classes.formErrors
                        }}
                        errors={formErrors}
                    />
                    <Form className={classes.form} getApi={setFormApi}>
                        <Field
                            classes={{ root: classes.listName }}
                            label={formatMessage({
                                id: 'global.fieldNameCreateWishlist',
                                defaultMessage: 'Enter the name of the list to create'
                            })}
                            optional={true}
                        >
                            <TextInput
                                field="name"
                                validate={isRequired}
                                validateOnBlur
                                data-cy="createWishlist-name"
                                placeholder={formatMessage({
                                    id: 'global.fieldNameCreateWishlist',
                                    defaultMessage: 'Enter the name of the list to create'
                                })}
                                onChange={(e) => setWishlistName(e.target.value)}
                            />
                        </Field>
                        <Button disabled={loading} priority={'high'} type={'submit'} onClick={(e) => handleCreateList(e)}>
                            <FormattedMessage
                                id={'createWishlist.save'}
                                defaultMessage={'Save'}
                            />
                        </Button>
                    </Form>
                </Modal>
            )
        }
        <Modal
            title={formatMessage({
                id: 'global.notification',
                defaultMessage: 'Notification'
            })}
            isOpen={showModalWarning}
            handleClose={handleCloseMaximumModal}
            classes={{
                innerWidth: classes.modalWidth
            }}
            isMask={true}
        >
            <div className={classes.modalMaximum}>
                <div className={classes.content}>
                    <p>
                        <FormattedMessage
                            id={'global.limitWishlistText'}
                            defaultMessage={'You have reached the list creation limit'}
                        />
                    </p>
                </div>
                <div className={classes.modalFooter}>
                    <Button
                        priority={'high'}
                        onClick={handleCloseMaximumModal}
                    >
                        <FormattedMessage
                            id={'global.agree'}
                            defaultMessage={'Agree'}
                        />
                    </Button>
                </div>
            </div>
        </Modal>
    </div>;
};

export default CreateWishlist;

CreateWishlist.propTypes = {
    classes: shape({
        body: string,
        buttons: string,
        createButton: string,
        icon: string,
        labelContainer: string,
        listName: string,
        radioLabel: string,
        radioMessage: string,
        radioRoot: string,
        root: string
    })
};
