import React, {useState, useEffect} from "react";
import { useQuery } from '@apollo/client';
import GET_FLASHSALE_PRODUCTS from "./flashsaleProducts.gql";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/FlashsaleProducts/flashsaleProducts.module.scss';
import productClasses from '@magento/pagebuilder/lib/ContentTypes/Products/products.module.css';
import productCustomClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/products.module.scss';
import {FormattedMessage} from "react-intl";
import Gallery from "@magento/venia-ui/lib/components/Gallery";
import Carousel from "@magento/pagebuilder/lib/ContentTypes/Products/Carousel/carousel";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import {Link} from "react-router-dom";
import Shimmer from "@magento/venia-ui/lib/components/Shimmer";

const FlashsaleProducts = ({pageSize, url, title}) => {
    const classes = useStyle(defaultClasses, productClasses, productCustomClasses);
    const { loading, error, data } = useQuery(GET_FLASHSALE_PRODUCTS, {
            variables: { pageSize: pageSize },
            fetchPolicy: 'no-cache'
        }
    );

    const items = !error && data?.getFlashSaleProducts?.items ? data.getFlashSaleProducts.items : [];

    const {isMobile } = useMediaCheck();

    if (items.length === 0) {
        return <></>
    }

    const flashsaleProductsClasses = items.length < 6 ? (' productsLength' + items.length) : '';
    const carouselSettings = {
        slidesToShow: items.length < 6 ? items.length : 6,
        slidesToScroll: items.length < 6 ? items.length : 6,
        autoplay: false,
        arrows: true,
        dots: false,
        centerMode: false,
        swipeToSlide: true,
        infinite: true,
        responsive: [
            {
                breakpoint: 1479,
                settings: {
                    slidesToShow: items.length < 5 ? items.length : 5,
                    slidesToScroll: items.length < 5 ? items.length : 5
                }
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: items.length < 4 ? items.length : 4,
                    slidesToScroll: items.length < 4 ? items.length : 4
                }
            },
            {
                breakpoint: 959,
                settings: {
                    slidesToShow: items.length < 3 ? items.length : 3,
                    slidesToScroll: items.length < 3 ? items.length : 3
                }
            }
        ]
    }

    const CountdownTimer = ({ endTime }) => {
        const [timeRemaining, setTimeRemaining] = useState({
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00'
        });

        useEffect(() => {
            const targetDate = new Date(endTime).getTime();

            if (isNaN(targetDate) || targetDate <= Date.now()) {
                // Nếu end_time là quá khứ hoặc không hợp lệ
                setTimeRemaining({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = targetDate - now;

                if (distance <= 0) {
                    // Khi đếm ngược kết thúc
                    clearInterval(interval);
                    setTimeRemaining({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                } else {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    setTimeRemaining({
                        days: days.toString().padStart(2, '0'),
                        hours: hours.toString().padStart(2, '0'),
                        minutes: minutes.toString().padStart(2, '0'),
                        seconds: seconds.toString().padStart(2, '0')
                    });
                }
            }, 1000);

            return () => clearInterval(interval);
        }, [endTime]);

        return (
            <div className={classes.countDown}>
                {timeRemaining.days !== 0 && timeRemaining.days !== '00' && (
                    <>
                        <span className={classes.days}>
                            {timeRemaining.days}
                        </span>
                        <span className={classes.divider}>:</span>
                    </>
                )}
                <span className={classes.hours}>{timeRemaining.hours}</span>
                <span className={classes.divider}>:</span>
                <span className={classes.minutes}>{timeRemaining.minutes}</span>
                <span className={classes.divider}>:</span>
                <span className={classes.seconds}>{timeRemaining.seconds}</span>
            </div>
        );
    };

    return (
        <div className={classes.flashsaleProductsWrapper}>
            <div className={classes.flashsaleProductsTitle + ' home-products-title'}>
                <h2>
                    <span>
                        {
                            title ? title : (
                                <FormattedMessage
                                    id={'flashsaleProduct.title'}
                                    defaultMessage={'Flash sale'}
                                />
                            )
                        }
                    </span>
                    {data?.getFlashSaleProducts?.end_time ? (
                        <CountdownTimer endTime={data.getFlashSaleProducts.end_time} />
                    ) : ''}
                </h2>
                <div className={'pagebuilderButtons'}>
                    <div>
                    {
                        (url.startsWith('https://') || url.startsWith('http://')) ? (
                            <a className={classes.flashsaleLink} href={url}>
                                <FormattedMessage id={'global.viewAll'} defaultMessage={'View all'} />
                            </a>
                        ) : (
                            <Link
                                className={classes.flashsaleLink}
                                to={url}
                            >
                                <FormattedMessage id={'global.viewAll'} defaultMessage={'View all'} />
                            </Link>
                        )
                    }
                    </div>
                </div>
            </div>
            <div className={classes.flashsaleProducts + flashsaleProductsClasses}>
                <div className={'products-background-wrapper'}>
                    <div className={classes.carousel}>
                        {
                            loading ? (
                                <Shimmer width="100%" height="381px" />
                            ) : (
                                isMobile ? (
                                    <div className={classes.unslickWrapper}>
                                        <Gallery items={items} classes={{items: classes.galleryItems}}/>
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

export default FlashsaleProducts;
