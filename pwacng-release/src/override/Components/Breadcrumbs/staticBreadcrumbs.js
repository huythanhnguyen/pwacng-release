import React, { Fragment, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { string } from 'prop-types';
import { Link } from 'react-router-dom';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/Breadcrumbs/extendStyle/breadcrumbs.module.scss';

/**
 * Breadcrumbs! Generates a sorted display of category links.
 *
 * @param {String} props.categoryId the uid of the category for which to generate breadcrumbs
 * @param {String} props.currentProduct the name of the product we're currently on, if any.
 */
const StaticBreadcrumbs = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const { pageTitle, isBlog, parentTitle, setIsDeliveryTracking } = props;

    // If we have a "currentProduct" it means we're on a PDP so we want the last
    // category text to be a link. If we don't have a "currentProduct" we're on
    // a category page so it should be regular text.
    const currentPage = (<span className={classes.currentPage} dangerouslySetInnerHTML={{ __html: pageTitle }} />);

    return (
        <div className={classes.root} aria-live="polite" aria-busy="false">
            <Link className={classes.link} to="/">
                <FormattedMessage id={'global.home'} defaultMessage={'Home'} />
            </Link>
            {
                isBlog && (
                    <>
                        <span className={classes.divider}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="#005C98" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                        <Link className={classes.link} to="/blog">
                            <FormattedMessage id={'global.blog'} defaultMessage={'Blog'} />
                        </Link>
                    </>
                )
            }
            {
                (!!parentTitle && setIsDeliveryTracking) && (
                    <>
                        <span className={classes.divider}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="#005C98" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                        <button className={classes.link} onClick={() => setIsDeliveryTracking(false)}>
                            <span dangerouslySetInnerHTML={{ __html: parentTitle }} />
                        </button>
                    </>
                )
            }
            <span className={classes.divider}>
                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="#C4C4C4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            {currentPage}
        </div>
    );
};

export default StaticBreadcrumbs;

StaticBreadcrumbs.propTypes = {
    categoryId: string,
    currentProduct: string
};

StaticBreadcrumbs.defaultProps = {
    isBlog: null,
    parentTitle: null,
    setIsDeliveryTracking: () => {}
};
