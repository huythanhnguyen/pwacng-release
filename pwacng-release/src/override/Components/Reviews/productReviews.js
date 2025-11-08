import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import PRODUCT_DETAIL_REVIEWS from "../Product/productDetailReviews.gql";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "@magenest/theme/BaseComponents/Reviews/productReviews.module.scss";
import {FormattedMessage} from "react-intl";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    FastForward as FastForwardIcon,
    Rewind as RewindIcon
} from 'react-feather';

const ProductReviews = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const { sku } = props;
    const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);

    const { data, error, loading, refetch } = useQuery(PRODUCT_DETAIL_REVIEWS, {
        variables: {
            sku: sku,
            pageSize: 4,
            currentPage: reviewsCurrentPage
        }
    });

    useEffect(() => {
        refetch({
            sku: sku,
            pageSize: 4,
            currentPage: reviewsCurrentPage
        });
    }, [reviewsCurrentPage, refetch]);

    const handlePageChange = (pageNumber) => {
        setReviewsCurrentPage(pageNumber);
    };

    const reviews = data?.products?.items[0]?.reviews?.items || [];
    const totalPages = data?.products?.items[0]?.reviews?.page_info.total_pages;

    const getPagesToShow = () => {
        const pages = [];
        const startPage = Math.max(1, reviewsCurrentPage - 1); // Bắt đầu từ 2 trang trước trang hiện tại
        const endPage = Math.min(totalPages - 1, reviewsCurrentPage + 1); // Kết thúc với 2 trang sau trang hiện tại

        if (reviewsCurrentPage === 1) {
            pages.push(1);
            if (totalPages > 2) pages.push(2);
            if (totalPages > 3) pages.push(3);
        }
        else if (reviewsCurrentPage === totalPages || reviewsCurrentPage === (totalPages - 1)) {
            if (totalPages > 3) pages.push(totalPages - 3);
            if (totalPages > 2) pages.push(totalPages - 2);
            if (totalPages > 1) pages.push(totalPages - 1);
        }
        else {
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const formatDate = (created_at) => {
        if (!created_at) return '';
        return new Date(created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).replace(',', '/');
    };

    const pagesToShow = getPagesToShow();

    return (
        reviews.length > 0 ? (
            <div className={classes.root}>
                <div className={classes.reviewsTitle}>
                    <FormattedMessage
                        id={'productReviews.title'}
                        defaultMessage={'Customer reviews'}
                    />
                </div>
                <div className={classes.reviewsContent}>
                {
                    reviews.length > 0 && (
                        reviews.map((review, index) => (
                            <div className={classes.reviewItem} key={index}>
                                <div className={classes.reviewName}>
                                    <div className={classes.reviewNameColumn}>
                                        <span className={classes.nickname}>{review.nickname}</span>
                                        <p className={classes.ratingSummary}>
                                            <span className={classes.ratingSummaryInner} style={{width: review.average_rating + '%'}}></span>
                                        </p>
                                    </div>
                                    <span className={classes.createdAt}>{formatDate(review.created_at)}</span>
                                </div>
                                <p className={classes.reviewSummary}>{review.summary}</p>
                                <p className={classes.reviewDetail}>{review.text}</p>
                            </div>
                        ))
                    )
                }
                </div>
                {
                    totalPages > 1 && (
                        <div className={classes.pagination}>
                            <button className={classes.firstPage} onClick={() => handlePageChange(reviewsCurrentPage - 1)} disabled={reviewsCurrentPage === 1}>
                                <Icon className={(reviewsCurrentPage === 1) ? classes.icon_disabled : classes.icon} size={20} src={ChevronLeftIcon} />
                            </button>
                            {pagesToShow.map(page => (
                                <button
                                    key={page}
                                    className={reviewsCurrentPage === page ? classes.activePage : ''}
                                    onClick={() => handlePageChange(page)}
                                >
                                    <span>{page}</span>
                                </button>
                            ))}
                            <button className={classes.lastPage} onClick={() => handlePageChange(reviewsCurrentPage + 1)} disabled={reviewsCurrentPage === totalPages}>
                                <Icon className={(reviewsCurrentPage === totalPages) ? classes.icon_disabled : classes.icon} size={20} src={ChevronRightIcon} />
                            </button>
                        </div>
                    )
                }
            </div>
        ) : (<></>)
    );
};

export default ProductReviews;
