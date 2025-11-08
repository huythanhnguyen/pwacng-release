import React, {Fragment, useEffect, useRef, useState} from 'react';
import { FormattedMessage } from 'react-intl';
import RichContent from '@magento/venia-ui/lib/components/RichContent/richContent';
import AdditionalAttributes from './AdditionalAttributes/additionalAttributes';
import ProductReviews from "../Reviews/productReviews";
import ReviewForm from "../Reviews/reviewForm";
import TotalReviewsPercent from "../Reviews/totalReviewsPercent";

const DescriptionTabs = props => {
    const {
        classes,
        isMobile,
        product,
        productDetails
    } = props;

    const contentRef = useRef(null);
    const [activeTab, setActiveTab] = useState('infoTab');
    const [descriptionActive, setDescriptionActive] = useState(false);
    const [infoActive, setInfoActive] = useState(false);
    const [reviewsActive, setReviewsActive] = useState(false);

    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState('202px');

    useEffect(() => {
        if (descriptionExpanded) {
            setMaxHeight(`${contentRef.current.scrollHeight}px`);
        } else {
            setMaxHeight('202px');
        }
    }, [descriptionExpanded]);

    const descriptionText = productDetails.description?.html
        ? productDetails.description.html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<\/?[^>]+(>|$)/g, '')
        : '';

    const toggleDescription = () => {
        setDescriptionExpanded(!descriptionExpanded);
    };

    return (
        <Fragment>
            <div className={classes.descriptionTabs}>
                <h2 className={classes.seoTag}>
                    <FormattedMessage id="global.productInformation" defaultMessage="Product Information" />
                </h2>
                <div className={classes.descriptionTabTitles}>
                    <button className={`${activeTab === 'descriptionTab' ? classes.tabActive : ''}`} onClick={() => setActiveTab('descriptionTab')}>
                                <span
                                    data-cy="ProductFullDetail-descriptionTitle"
                                    className={classes.descriptionTitle}
                                >
                                    <FormattedMessage
                                        id={'productFullDetail.description'}
                                        defaultMessage={'Product details'}
                                    />
                                </span>
                    </button>
                    <button className={`${activeTab === 'infoTab' ? classes.tabActive : ''}`} onClick={() => setActiveTab('infoTab')}>
                                <span
                                    data-cy="ProductFullDetail-infoTitle"
                                    className={classes.infoTitle}
                                >
                                    <FormattedMessage
                                        id={'productFullDetail.info'}
                                        defaultMessage={'More information'}
                                    />
                                </span>
                    </button>
                    <button className={`${activeTab === 'reviewsTab' ? classes.tabActive : ''}`} onClick={() => setActiveTab('reviewsTab')}>
                                <span
                                    data-cy="ProductFullDetail-reviewsTitle"
                                    className={classes.reviewsTitle}
                                >
                                    <FormattedMessage
                                        id={'productFullDetail.reviews'}
                                        defaultMessage={'Review'}
                                    />
                                </span>
                    </button>
                </div>
                <div className={classes.descriptionContainer}>
                    <div className={descriptionActive ? classes.descriptionTitle + ' active' : classes.descriptionTitle} onClick={() => setDescriptionActive(!descriptionActive)}>
                        <FormattedMessage
                            id={'productFullDetail.description'}
                            defaultMessage={'Product details'}
                        />
                    </div>
                    {((activeTab === 'descriptionTab' && !isMobile) || (descriptionActive && isMobile)) && (
                        <>
                            {descriptionText.length > 1000 ? (
                                <section className={descriptionExpanded ? `${classes.description} ${classes.descriptionExpanded}` : `${classes.description} ${classes.descriptionCollapsed}`}>
                                    <div className={classes.descriptionInner}
                                         style={{ maxHeight }}
                                         ref={contentRef}
                                    >
                                        <RichContent html={productDetails.description.html} />
                                    </div>
                                    {descriptionExpanded ? (
                                        <button onClick={toggleDescription} className={classes.showLessButton}>
                                            <FormattedMessage
                                                id={'productFullDetail.showLessButton'}
                                                defaultMessage={'Show Less'}
                                            />
                                        </button>
                                    ) : (
                                        <button onClick={toggleDescription} className={classes.showMoreButton}>
                                            <FormattedMessage
                                                id={'productFullDetail.showMoreButton'}
                                                defaultMessage={'Show More'}
                                            />
                                        </button>
                                    )}
                                </section>
                            ) : (
                                <section className={classes.description}>
                                    <RichContent html={productDetails.description.html} />
                                </section>
                            )}
                        </>
                    )}
                </div>
                <div className={classes.infoContainer}>
                    <div className={infoActive ? classes.infoTitle + ' active' : classes.infoTitle} onClick={() => setInfoActive(!infoActive)}>
                        <FormattedMessage
                            id={'productFullDetail.info'}
                            defaultMessage={'More information'}
                        />
                    </div>
                    {((activeTab === 'infoTab' && !isMobile) || (infoActive && isMobile)) &&
                    <section className={classes.info}>
                        <AdditionalAttributes additionalAttributes={product.additional_attributes} />
                    </section>
                    }
                </div>
                <div className={classes.reviewsContainer}>
                    <div className={reviewsActive ? classes.reviewsTitle + ' active' : classes.reviewsTitle} onClick={() => setReviewsActive(!reviewsActive)}>
                        <FormattedMessage
                            id={'productFullDetail.reviews'}
                            defaultMessage={'Review'}
                        />
                    </div>
                    {((activeTab === 'reviewsTab' && !isMobile) || (reviewsActive && isMobile)) &&
                    <section className={classes.reviews}>
                        <div className={classes.totalReviews}>
                            <div className={classes.totalReviewsSummary}>
                                <p className={classes.ratingPoint}>{(product.rating_summary * 5 / 100).toFixed(1)}</p>
                                <p className={classes.ratingSummary}>
                                    <span className={classes.ratingSummaryInner} style={{width: product.rating_summary + '%'}}></span>
                                </p>
                                <span className={classes.reviewCount}>
                                                {product.review_count + ' '}
                                    {product.review_count > 1 ?
                                        <FormattedMessage
                                            id={'global.reviews'}
                                            defaultMessage={'reviews'}
                                        /> :
                                        <FormattedMessage
                                            id={'global.review'}
                                            defaultMessage={'review'}
                                        />
                                    }
                                            </span>
                            </div>
                            <TotalReviewsPercent sku={productDetails.sku}/>
                        </div>
                        <ReviewForm sku={productDetails.sku}/>
                        <ProductReviews sku={productDetails.sku} />
                    </section>
                    }
                </div>
            </div>
        </Fragment>
    );
};

export default DescriptionTabs;
