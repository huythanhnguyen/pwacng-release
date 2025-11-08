import React, { useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/ProductImageCarousel/extendStyle/fullscreen.module.scss';

const ProductImageLightbox = props => {
    const { imageUrl } = props;
    const classes = useStyle(defaultClasses, props.classes);

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button className={classes.zoomAction} onClick={() => setIsOpen(true)}><span>+</span></button>
            {isOpen && (
                <Lightbox
                    mainSrc={imageUrl}
                    onCloseRequest={() => setIsOpen(false)}
                    enableZoom={true} // Kích hoạt tính năng zoom
                />
            )}
        </>
    );
};

export default ProductImageLightbox;
