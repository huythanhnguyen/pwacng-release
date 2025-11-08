import React, { useRef } from "react";
import Gallery from "@magento/venia-ui/lib/components/Gallery";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./productMessageExtend.module.scss";
import useDraggableScroll from 'use-draggable-scroll';
import GalleryItemShimmer from "@magento/venia-ui/lib/components/Gallery/item.shimmer";
import {FormattedMessage} from "react-intl";

const ProductMessageExtend = props => {
    const {
        items,
        loading,
        handleShowFrame,
        handleChatbotOpened,
        handleOpenMore,
        setSignInRedirect
    } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const ref = useRef(null);
    const { onMouseDown } = useDraggableScroll(ref);

    if (loading) return (
        <div className={classes.productGalleryGroupShimmer}>
            <GalleryItemShimmer classes={classes} />
            <GalleryItemShimmer classes={classes} />
            <GalleryItemShimmer classes={classes} />
            <GalleryItemShimmer classes={classes} />
        </div>
    )
    if (!items?.length) return null;

    return (
        <div className={classes.suggestionProducts}>
            <div
                ref={ref}
                onMouseDown={onMouseDown}
                className={classes.galleryItemsWrapper}
            >
                <Gallery items={items} classes={{ items: classes.galleryItems }} handleShowFrame={handleShowFrame} handleChatbotOpened={handleChatbotOpened} handleSignInRedirect={() => setSignInRedirect(true)}/>
            </div>
            <div className={classes.more}>
                <button
                    className={classes.moreProducts}
                    onClick={() => handleOpenMore(items)}
                >
                    <FormattedMessage
                        id={'chatbot.moreProducts'}
                        defaultMessage={'See more products'}
                    />
                </button>
            </div>
        </div>
    );
};

export default ProductMessageExtend;
