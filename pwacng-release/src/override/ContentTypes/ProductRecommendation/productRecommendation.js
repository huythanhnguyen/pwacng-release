import React, {useState, useEffect, useRef} from "react";
import { useQuery } from '@apollo/client';
import GET_PRODUCTS_RECOMMENDATION from "./productRecommendation.gql";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/ProductRecommendation/productRecommendation.module.scss';
import productClasses from '@magento/pagebuilder/lib/ContentTypes/Products/products.module.css';
import productCustomClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/products.module.scss';
import {FormattedMessage} from "react-intl";
import Gallery from "@magento/venia-ui/lib/components/Gallery";
import Carousel from "@magento/pagebuilder/lib/ContentTypes/Products/Carousel/carousel";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import Shimmer from "@magento/venia-ui/lib/components/Shimmer";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useLocation} from "react-router-dom";

const ProductRecommendation = ({pageSize, asmJourneyId, customStyle, color, image, imageMobile}) => {
    const classes = useStyle(defaultClasses, productClasses, productCustomClasses);
    const location = useLocation();
    const { pathname } = location;
    const [{ isSignedIn, currentUser }] = useUserContext();
    const phoneNumber = isSignedIn ? currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || null : null;
    const currentURL = window.location.href;

    const wrapperRef = useRef(null);
    const [hasTrackedView, setHasTrackedView] = useState(false);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const asmUid = getCookie('_asm_uid') || localStorage.getItem('_asm_uid') || '';
    const normalizedPath = pathname.replace(/^\/|\/$/g, '');
    const extra = {
        page_type: pathname === '/' ? "Home" : normalizedPath,
        page_category: pathname === '/' ? "Home" : normalizedPath,
        location_url: currentURL,
        cart_subtotal: null,
        cart_item_count: null
    };

    const { loading, error, data } = useQuery(GET_PRODUCTS_RECOMMENDATION, {
            variables: {
                asmUid,
                asmJourneyId,
                pageSize,
                dims: {
                    phone_number: phoneNumber
                },
                extra,
                ec: "pageview",
                ea: "view"
            },
            fetchPolicy: 'no-cache'
        }
    );

    const items = !error && data?.productsV2?.items ? data.productsV2.items : [];

    useEffect(() => {
        if (data?.productsV2?.globalTracking?.impression) {
            try {
                window.web_event.trackEventWithUri(data.productsV2.globalTracking.impression);
            } catch (error) {
                console.log(error);
            }
        }
    },[data]);

    useEffect(() => {
        if (!data?.productsV2?.globalTracking?.view || hasTrackedView) return;

        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    try {
                        window.web_event.trackEventWithUri(data.productsV2.globalTracking.view);
                    } catch (error) {
                        console.log(error);
                    }
                    setHasTrackedView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 } // khi 20% wrapper xuất hiện thì trigger
        );

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }

        return () => observer.disconnect();
    }, [data, hasTrackedView]);

    const {isMobile } = useMediaCheck();

    if (items.length === 0) {
        return <></>
    }

    const cartLayout = customStyle.split(' ').includes('cartLayout');
    const gridLayout = customStyle.split(' ').includes('gridLayout');
    const twoColumnsLayout = customStyle.split(' ').includes('twoColumnsLayout');
    const additionalClass = `${color ? classes.applyStyle : ''} ${twoColumnsLayout ? 'banner-products-group' : ''} ${color && twoColumnsLayout ? classes.fullBleed : ''}`;

    const carouselSettings = cartLayout ? {
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: false,
        arrows: true,
        dots: false,
        centerMode: false,
        swipeToSlide: true,
        infinite: items.length > 4 || false,
        responsive: [
            {
                breakpoint: 1480,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: items.length > 3 || false
                }
            },
            {
                breakpoint: 1023,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: items.length > 2 || false
                }
            }
        ]
    } : twoColumnsLayout ? {
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: false,
        arrows: true,
        dots: false,
        centerMode: false,
        swipeToSlide: true,
        infinite: items.length > 3 || false,
        responsive: [
            {
                breakpoint: 1325,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: items.length > 2 || false
                }
            }
        ]
    } : {
        slidesToShow: 6,
        slidesToScroll: 6,
        autoplay: false,
        arrows: true,
        dots: false,
        centerMode: false,
        swipeToSlide: true,
        infinite: items.length > 6 || false,
        responsive: [
            {
                breakpoint: 1479,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 5,
                    infinite: items.length > 5 || false
                }
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    infinite: items.length > 4 || false
                }
            },
            {
                breakpoint: 959,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: items.length > 3 || false
                }
            }
        ]
    };

    return (
        <div ref={wrapperRef} className={`${classes.productRecommendationWrapper} ${customStyle} ${additionalClass}`}
             style={color && twoColumnsLayout ? { backgroundColor: color } : null}>
            <div className={color && twoColumnsLayout ? classes.contained : ''}>
                <div className={color ? `${classes.productRecommendation} products-background-wrapper` : classes.productRecommendation} style={color ? { backgroundColor: color } : null}>
                    {isMobile && !!imageMobile ? (
                        <img className={classes.productRecommendationBanner} src={imageMobile} alt={''}/>
                    ) : (
                        <>
                            { !!image && <img className={classes.productRecommendationBanner} src={image} alt={''}/> }
                        </>
                    )}
                    <div className={classes.carousel}>
                        {
                            loading ? (
                                <Shimmer width="100%" height="381px" />
                            ) : (
                                (isMobile || gridLayout) ? (
                                    <div className={gridLayout ? classes.gridWrapper : classes.unslickWrapper}>
                                        <Gallery items={items} classes={{items: gridLayout ? classes.gridGalleryItems : classes.galleryItems}}/>
                                    </div>
                                ) : (
                                    <div className={classes.productsGallery}>
                                        <Carousel settings={carouselSettings} items={items}/>
                                    </div>
                                )
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ProductRecommendation;
