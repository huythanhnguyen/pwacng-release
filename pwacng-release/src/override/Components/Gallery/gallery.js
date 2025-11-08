import React, { useMemo } from 'react';
import { string, shape, array } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import GalleryItem from './item';
import GalleryItemShimmer from '@magento/venia-ui/lib/components/Gallery/item.shimmer';
import defaultClasses from '@magento/venia-ui/lib/components/Gallery/gallery.module.css';
import galleryClasses from '@magenest/theme/BaseComponents/Gallery/extendStyle/gallery.module.scss'
import sliderCustomClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/slider.module.scss';
import { useGallery } from '@magento/peregrine/lib/talons/Gallery/useGallery';
import SlickSlider from "react-slick";

/**
 * Renders a Gallery of items. If items is an array of nulls Gallery will render
 * a placeholder item for each.
 *
 * @params {Array} props.items an array of items to render
 */
const Gallery = props => {
    const { items, isSlider, sliderConfig, slideToShow, searchTerm = null, isSeo = false, handleShowFrame, handleChatbotOpened, handleSignInRedirect } = props;
    const classes = useStyle(defaultClasses, sliderCustomClasses, galleryClasses, props.classes);
    const talonProps = useGallery();
    const { storeConfig } = talonProps;

    const itemsClasses = isSlider ? classes.slider : classes.items;

    const galleryItems = useMemo(
        () =>
            items.map((item, index) => {
                if (item === null) {
                    return <GalleryItemShimmer key={index} />;
                }
                return (
                    <GalleryItem
                        key={item.id}
                        item={item}
                        storeConfig={storeConfig}
                        searchTerm={searchTerm}
                        isSeo={isSeo}
                        handleShowFrame={handleShowFrame}
                        handleChatbotOpened={handleChatbotOpened}
                        handleSignInRedirect={handleSignInRedirect}
                    />
                );
            }),
        [items, storeConfig]
    );

    const sliderProps = {
        arrows: true,
        dots: false,
        swipeToSlide: true,
        infinite: items.length > slideToShow,
        slidesToShow: slideToShow,
        slidesToScroll: slideToShow,
        responsive: sliderConfig,
        lazyLoad: true
    }

    return (
        <div data-cy="Gallery-root" className={classes.root} aria-busy="false">
            <div className={itemsClasses}>
                {
                    isSlider ? (
                        <SlickSlider {...sliderProps}>
                            {galleryItems}
                        </SlickSlider>
                    ) : galleryItems
                }
            </div>
        </div>
    );
};

Gallery.propTypes = {
    classes: shape({
        filters: string,
        items: string,
        pagination: string,
        root: string
    }),
    items: array.isRequired
};

export default Gallery;
