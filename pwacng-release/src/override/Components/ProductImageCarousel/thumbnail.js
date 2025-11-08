import React, {useMemo, useRef, useState} from 'react';
import { bool, func, number, shape, string } from 'prop-types';

import { transparentPlaceholder } from '@magento/peregrine/lib/util/images';
import { useWindowSize } from '@magento/peregrine';
import { useThumbnail } from '@magento/peregrine/lib/talons/ProductImageCarousel/useThumbnail';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/ProductImageCarousel/extendStyle/thumbnail.module.scss';
import Image from '@magento/venia-ui/lib/components/Image';
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import placeholder from "@magenest/theme/static/images/logommvn-placeholder.jpg";
import YouTube from "react-youtube";

const DEFAULT_THUMBNAIL_HEIGHT = 755;
const DEFAULT_THUMBNAIL_WIDTH = 755;

/**
 * The Thumbnail Component is used for showing thumbnail preview image for ProductImageCarousel
 * Shows up only in desktop devices
 *
 * @typedef Thumbnail
 * @kind functional component
 *
 * @param {props} props
 *
 * @returns {React.Element} React thumbnail component that displays product thumbnail
 */
const Thumbnail = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { isDesktop } = useMediaCheck();
    const playerRef = useRef(null);
    const [ isToggle, setIsToggle ] = useState(true);

    const {
        isActive,
        item: { file, label, video_content },
        onClickHandler,
        itemIndex
    } = props;

    const talonProps = useThumbnail({
        onClickHandler,
        itemIndex
    });

    const { handleClick } = talonProps;
    const selectedItem = isActive ? 'Current Image' : 'Next Image';

    const handlePlay = () => {
        if (playerRef.current) {
            playerRef.current.playVideo();
            setIsToggle(false);
        }
    };

    const thumbnailImage = useMemo(() => {
        if (video_content && !isDesktop) {
            return (
                <div className={`${classes.video} ${isToggle ? classes.isToggle : ''}`} onClick={handlePlay}>
                    <YouTube
                        videoId={video_content.video_url.split('/').pop()}
                        onReady={(event) => playerRef.current = event.target}
                        onPause={() => setIsToggle(true)}
                    />
                </div>
            )
        } else {
            return file ? (
                <Image
                    alt={label ? label : 'product'}
                    classes={{ image: classes.image }}
                    height={DEFAULT_THUMBNAIL_HEIGHT}
                    resource={file}
                    width={DEFAULT_THUMBNAIL_WIDTH}
                />
            ) : (
                <Image
                    alt={label ? label : 'product'}
                    classes={{ image: classes.image }}
                    src={placeholder}
                />
            );
        }
    }, [file, label, classes.image, isToggle]);

    return (
        <button
            type="button"
            className={isActive ? classes.rootSelected : classes.root}
            onClick={handleClick}
            aria-label={selectedItem}
        >
            {thumbnailImage}
        </button>
    );
};

/**
 * Props for {@link Thumbnail}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the Thumbnail component
 * @property {string} classes.root classes for root container
 * @property {string} classes.rootSelected classes for the selected thumbnail item
 * @property {bool} isActive is image associated is active in carousel
 * @property {string} item.label label for image
 * @property {string} item.file filePath of image
 * @property {number} itemIndex index number of thumbnail
 * @property {func} onClickHandler A callback for handling click events on thumbnail
 */
Thumbnail.propTypes = {
    classes: shape({
        root: string,
        rootSelected: string
    }),
    isActive: bool,
    item: shape({
        label: string,
        file: string.isRequired
    }),
    itemIndex: number,
    onClickHandler: func.isRequired
};

export default Thumbnail;
