import React, { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { bool, shape, string, int } from 'prop-types';
import { EditSquare, Trash } from '@magenest/theme/static/icons';
import { useStyle } from '@magento/venia-ui/lib/classify';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import WishlistItems from '@magento/venia-ui/lib/components/WishlistPage/wishlistItems';
import Button from '@magento/venia-ui/lib/components/Button';
import defaultClasses from '@magento/venia-ui/lib/components/WishlistPage/wishlist.module.css';
import wishlistClasses from '@magenest/theme/BaseComponents/WishlistPage/extendStyle/wishlist.module.scss';
import useMediaCheck from "@magenest/theme/Hooks/MediaCheck/useMediaCheck";

/**
 * A single wishlist container.
 *
 * @param {Object} props.data the data for this wishlist
 * @param {boolean} props.shouldRenderVisibilityToggle whether or not to render the visiblity toggle
 * @param {boolean} props.isCollapsed whether or not is the wishlist unfolded
 */
const Wishlist = props => {
    const {
        data,
        idDefault,
        handleRename,
        handleDelete,
        isLoading,
        openedWishlistId,
        setOpenedWishlistId
    } = props;
    const { id, items_count: itemsCount, name } = data;
    const { isMobile } = useMediaCheck();
    const classes = useStyle(defaultClasses, wishlistClasses, props.classes);

    const contentMessageElement = itemsCount ? (
        <Fragment>
            <WishlistItems wishlistId={id} />
        </Fragment>
    ) : (
        <p className={classes.emptyListText}>
            <FormattedMessage
                id={'wishlist.emptyListText'}
                defaultMessage={'There are currently no items in this list'}
            />
        </p>
    );

    const wishlistName = name ? (
        <strong className={classes.name} data-cy="Wishlist-name" title={name}>
            {name}
            <span className={classes.count}>({itemsCount})</span>
        </strong>
    ) : (
        <strong className={classes.name}>
            <FormattedMessage
                id={'global.defaultWishlistName'}
                defaultMessage={'Default wishlist <highlight>{itemsCount}</highlight>'}
                values={{
                    highlight: chunks => (
                        <span className={classes.count}>({chunks})</span>
                    ),
                    itemsCount: itemsCount
                }}
            />
        </strong>
    );

    if (isLoading) {
        return (
            <div className={classes.root}>
                <div className={classes.headerWrapper}>
                    <div className={classes.header}>
                        {wishlistName}
                    </div>
                    {
                        !idDefault && (
                            <div className={classes.actions}>
                                <Button disabled={true} type={'button'} priority={'normal'}>
                                    <img src={EditSquare} alt={''} />
                                    {
                                        !isMobile && (
                                            <FormattedMessage
                                                id={'global.rename'}
                                                defaultMessage={'Rename'}
                                            />
                                        )
                                    }
                                </Button>
                                <Button disabled={true} type={'button'} priority={'normal'}>
                                    <img src={Trash} alt={''}/>
                                    {
                                        !isMobile && (
                                            <FormattedMessage
                                                id={'global.delete'}
                                                defaultMessage={'Delete'}
                                            />
                                        )
                                    }
                                </Button>
                            </div>
                        )
                    }
                </div>
                <LoadingIndicator/>
            </div>
        );
    }

    return (
        <div className={classes.root} data-cy="Wishlist-root">
            <div className={classes.headerWrapper}>
                <div role="button" onClick={() => setOpenedWishlistId(prev => prev === id ? null : id)}
                     className={`${openedWishlistId === id ? classes.collapsed : ''} ${classes.header}`}>
                    <span className={classes.icon}></span>
                    {wishlistName}
                </div>
                {
                    !idDefault && (
                        <div className={classes.actions}>
                            <Button onClick={() => handleRename(id, name, itemsCount)} type={'button'} priority={'normal'}>
                                <img src={EditSquare} alt={''} />
                                {
                                    !isMobile && (
                                        <FormattedMessage
                                            id={'global.rename'}
                                            defaultMessage={'Rename'}
                                        />
                                    )
                                }
                            </Button>
                            <Button onClick={() => handleDelete(id, name, itemsCount)} type={'button'} priority={'normal'}>
                                <img src={Trash} alt={''}/>
                                {
                                    !isMobile && (
                                        <FormattedMessage
                                            id={'global.delete'}
                                            defaultMessage={'Delete'}
                                        />
                                    )
                                }
                            </Button>
                        </div>
                    )
                }
            </div>
            {(openedWishlistId === id) && contentMessageElement}
        </div>
    );
};

Wishlist.propTypes = {
    classes: shape({
        root: string,
        header: string,
        content: string,
        content_hidden: string,
        emptyListText: string,
        name: string,
        nameContainer: string,
        visibilityToggle: string,
        visibilityToggle_hidden: string,
        visibility: string,
        loadMore: string
    }),
    shouldRenderVisibilityToggle: bool,
    isCollapsed: bool,
    data: shape({
        id: int,
        items_count: int,
        name: string,
        visibility: string
    })
};

Wishlist.defaultProps = {
    data: {
        items_count: 0,
        items_v2: []
    }
};

export default Wishlist;
