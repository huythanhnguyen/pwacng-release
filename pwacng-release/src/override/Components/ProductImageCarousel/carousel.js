import React, {useContext, useMemo} from 'react';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import { useIntl } from 'react-intl';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from 'react-feather';

import { transparentPlaceholder } from '@magento/peregrine/lib/util/images';
import { useProductImageCarousel } from '@magento/peregrine/lib/talons/ProductImageCarousel/useProductImageCarousel';
import {generateSrcset} from '@magento/peregrine/lib/util/imageUtils';

import { useStyle } from '@magento/venia-ui/lib/classify';
import AriaButton from '@magento/venia-ui/lib/components/AriaButton';
import Icon from '@magento/venia-ui/lib/components/Icon';
import Image from '@magento/venia-ui/lib/components/Image';
import defaultClasses from '@magenest/theme/BaseComponents/ProductImageCarousel/extendStyle/carousel.module.scss';
import sliderCustomClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/slider.module.scss';
import Thumbnail from '@magento/venia-ui/lib/components/ProductImageCarousel/thumbnail';
import SlickSlider from "react-slick";
import ProductImageLightbox from "./fullscreen";
import useMediaCheck from "@magenest/theme/Hooks/MediaCheck/useMediaCheck";
import { UserAgentContext } from "@magenest/theme/Hooks/UserAgentCheck/UserAgentContext";
import placeholder from "@magenest/theme/static/images/logommvn-placeholder.jpg";

const IMAGE_WIDTH = 640;

/**
 * Carousel component for product images
 * Carousel - Component that holds number of images
 * where typically one image visible, and other
 * images can be navigated through previous and next buttons
 *
 * @typedef ProductImageCarousel
 * @kind functional component
 *
 * @param {props} props
 *
 * @returns {React.Element} React carousel component that displays a product image
 */
const ProductImageCarousel = props => {
    const { images, isAlcohol = false } = props;
    const { formatMessage } = useIntl();
    const talonProps = useProductImageCarousel({
        images,
        imageWidth: IMAGE_WIDTH
    });

    const { isLazyContent } = useContext(UserAgentContext);

    const {
        currentImage,
        activeItemIndex,
        altText,
        handleNext,
        handlePrevious,
        handleThumbnailClick,
        sortedImages
    } = talonProps;

    const classes = useStyle(defaultClasses, sliderCustomClasses, props.classes);

    let image;
    if (currentImage.video_content) {
        image = (
            <div className={classes.video}>
                <iframe
                    width="100%"
                    height="auto"
                    src={`https://www.youtube.com/embed/${currentImage.video_content.video_url.split('/').pop()}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentImage.video_content.video_title}
                />
            </div>
        )
    } else {
        if (currentImage.file) {
            image = (
                <Image
                    alt={altText}
                    classes={{
                        image: classes.currentImage,
                        root: classes.imageContainer
                    }}
                    resource={currentImage.file}
                    width={IMAGE_WIDTH}
                />
            );
        } else {
            image = (
                <Image
                    alt={altText}
                    classes={{
                        image: classes.currentImage_placeholder,
                        root: classes.imageContainer
                    }}
                    src={placeholder}
                />
            );
        }
    }

    if (isLazyContent) {
        return (<>{image}</>);
    }

    const { isDesktop } = useMediaCheck();

    // create thumbnail image component for every images in sorted order
    const thumbnails = useMemo(
        () => {
            if (sortedImages.length) {
                return sortedImages.map((item, index) => (
                    <Thumbnail
                        key={item.uid}
                        item={item}
                        itemIndex={index}
                        isActive={activeItemIndex === index}
                        onClickHandler={handleThumbnailClick}
                    />
                ))
            } else {
                return (
                    <Image alt={'placeholder'} resource={placeholder} />
                )
            }

        }, [activeItemIndex, handleThumbnailClick, sortedImages]
    );

    const imgSrc = currentImage.file ? generateSrcset(currentImage.file, 'image-product') : transparentPlaceholder;

    const previousButton = formatMessage({
        id: 'productImageCarousel.previousButtonAriaLabel',
        defaultMessage: 'Previous Image'
    });

    const nextButton = formatMessage({
        id: 'productImageCarousel.nextButtonAriaLabel',
        defaultMessage: 'Next Image'
    });

    const chevronClasses = { root: classes.chevron };

    const activeThumbMobile = !isDesktop
        ? currentSlide => {
            handleThumbnailClick(currentSlide);
        }
        : undefined;

    const sliderProps = {
        arrows: true,
        dots: false,
        infinite: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        responsive: [
            {
                breakpoint: 9999,
                settings: {
                    slidesToShow: 5,
                    arrows: true,
                    dots: false
                }
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    arrows: true,
                    dots: false
                }
            },
            {
                breakpoint: 1023,
                settings: {
                    slidesToShow: 1,
                    vertical: false,
                    verticalSwiping: false,
                    variableWidth: false,
                    arrows: false,
                    dots: true
                }
            }
        ],
        afterChange: activeThumbMobile
    }
    return (
        <div className={classes.root}>
            <div className={isAlcohol ? `${classes.carouselContainer} ${classes.alcoholTag}` : classes.carouselContainer}>
                <AriaButton
                    className={classes.previousButton}
                    onPress={handlePrevious}
                    aria-label={previousButton}
                    type="button"
                >
                    <Icon
                        classes={chevronClasses}
                        src={ChevronLeftIcon}
                        size={40}
                    />
                </AriaButton>
                {image}
                <AriaButton
                    className={classes.nextButton}
                    onPress={handleNext}
                    aria-label={nextButton}
                    type="button"
                >
                    <Icon
                        classes={chevronClasses}
                        src={ChevronRightIcon}
                        size={40}
                    />
                </AriaButton>
            </div>
            <div className={sortedImages.length === 5 ? `${classes.thumbnailList} ${classes.thumbnailList5Items}` : classes.thumbnailList}>
                {
                    (!isDesktop || sortedImages.length >= 5) ? (
                        <SlickSlider {...sliderProps}>
                            {thumbnails}
                        </SlickSlider>
                    ) : (<>{thumbnails}</>)
                }
            </div>
            <ProductImageLightbox
                imageUrl={imgSrc}
            />
        </div>
    );
};

/**
 * Props for {@link ProductImageCarousel}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the
 * ProductImageCarousel component
 * @property {string} classes.currentImage classes for visible image
 * @property {string} classes.imageContainer classes for image container
 * @property {string} classes.nextButton classes for next button
 * @property {string} classes.previousButton classes for previous button
 * @property {string} classes.root classes for root container
 * @property {Object[]} images Product images input for Carousel
 * @property {bool} images[].disabled Is image disabled
 * @property {string} images[].file filePath of image
 * @property {string} images[].uid the id of the image
 * @property {string} images[].label label for image
 * @property {string} images[].position Position of image in Carousel
 */
ProductImageCarousel.propTypes = {
    classes: shape({
        carouselContainer: string,
        currentImage: string,
        currentImage_placeholder: string,
        imageContainer: string,
        thumbnailList: string,
        thumbnailList5Items: string,
        nextButton: string,
        previousButton: string,
        root: string
    }),
    images: arrayOf(
        shape({
            label: string,
            position: number,
            disabled: bool,
            file: string.isRequired,
            uid: string.isRequired
        })
    ).isRequired
};

export default ProductImageCarousel;
