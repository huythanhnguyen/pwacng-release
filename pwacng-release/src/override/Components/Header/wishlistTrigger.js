import React, {useContext} from 'react';
import {FormattedMessage} from "react-intl";

import { useStyle } from '@magento/venia-ui/lib/classify';
import { Wishlist, WishlistBlack } from '@magenest/theme/static/icons'
import defaultClasses from '@magenest/theme/BaseComponents/Header/extendStyle/wishlistTrigger.module.scss'
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {Link} from "react-router-dom";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {WishlistContext} from "@magenest/theme/Context/Wishlist/wishlistContext";

const WishlistTrigger = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { isDesktop } = useMediaCheck();
    const [{ isSignedIn }] = useUserContext();
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const {derivedWishlists} = useContext(WishlistContext)

    const wishlistCounts = derivedWishlists?.reduce((item, current) => item + current.items_count, 0);

    return (
        <Link to={isSignedIn ? '/wishlist' : '/sign-in'} onClick={() => closeDrawer('menu')} className={classes.root}>
            {
                isDesktop ? (
                    <>
                        <FormattedMessage
                            id={'wishlist.label'}
                            defaultMessage={'My Items'}
                        />
                        {
                            (isSignedIn && wishlistCounts > 0) && (
                                <span className={classes.count}>{wishlistCounts}</span>
                            )
                        }
                    </>
                ) : (
                    <>
                        <img src={WishlistBlack} alt='wishlist'/>
                        {
                            (isSignedIn && wishlistCounts > 0) > 0 && (
                                <span className={classes.count}>{wishlistCounts}</span>
                            )
                        }
                    </>
                )
            }
        </Link>
    )
}

export default WishlistTrigger
