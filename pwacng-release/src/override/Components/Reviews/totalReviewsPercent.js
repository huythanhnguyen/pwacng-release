import React from 'react';
import { useQuery } from '@apollo/client';
import PRODUCT_DETAIL_REVIEWS_DISTRIBUTION from "../Product/productDetailReviewsDistribution.gql";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "@magenest/theme/BaseComponents/Reviews/totalReviewsPercent.module.scss";
import {FormattedMessage} from "react-intl";

const TotalReviewsPercent = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const { sku } = props;

    const { data, error, loading } = useQuery(PRODUCT_DETAIL_REVIEWS_DISTRIBUTION, {
        variables: {
            sku: sku
        }
    });

    if (!data) {
        if (loading || error) {
            return <></>;
        }
    }

    const reviewCount = data.products?.items[0]?.review_count ? data.products.items[0].review_count : 0;
    const reviewDistribution = data.products?.items[0]?.review_distribution ? data.products.items[0].review_distribution : [];
    const sortedReviewDistribution = [...reviewDistribution].sort((a, b) => b.level - a.level);

    const formatNumber = (number) => {
        return number.toLocaleString('en-US');
    };

    const getReviewItems = (reviewDistribution, reviewCount) => {
        return reviewDistribution
            .map(item => {
                const percent = ((item.count / reviewCount) * 100).toFixed(2);
                return {
                    level: item.level,
                    percent: `${percent}%`,
                    count: formatNumber(item.count)
                };
            });
    };

    const reviewItems = getReviewItems(sortedReviewDistribution, reviewCount);

    return (
        <div className={classes.totalReviewsPercent}>
            <table width="100%" border="0" cellSpacing="0" cellPadding="0">
                <tbody>
                {reviewItems.map((item, index) => (
                    <tr className={classes.percentItem} key={index}>
                        <td className={classes.percentName}>
                            <span>
                                {item.level + ' '}
                                {
                                    item.level > 1 ? (
                                        <FormattedMessage
                                            id={'global.starts'}
                                            defaultMessage={'starts'}
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id={'global.start'}
                                            defaultMessage={'start'}
                                        />
                                    )
                                }
                            </span>
                            <span className={classes.startIcon}></span>
                        </td>
                        <td className={classes.percentWrap}>
                            <div className={classes.percentInner}>
                                <span className={classes.percent} style={{width: item.percent}}></span>
                            </div>
                        </td>
                        <td className={classes.percentText}>
                            {item.count}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TotalReviewsPercent;
