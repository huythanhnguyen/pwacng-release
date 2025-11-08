import React, {Fragment, useContext} from 'react';
import { shape, string } from 'prop-types';

import CMSPageShimmer from '@magento/venia-ui/lib/RootComponents/CMS/cms.shimmer';
import { useCmsPage } from '@magento/peregrine/lib/talons/Cms/useCmsPage';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import SearchPopular from '@magenest/theme/BaseComponents/SearchBar/searchPopular';
import { Meta, StoreTitle } from '@magento/venia-ui/lib/components/Head';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { toCamelCase } from '@magento/venia-ui/lib/util/toCamelCase';
import { UserAgentContext } from "@magenest/theme/Hooks/UserAgentCheck/UserAgentContext";
import HomeSchema from "@magenest/theme/BaseComponents/Schema/homeSchema";

import defaultClasses from '@magento/venia-ui/lib/RootComponents/CMS/cms.module.css';
import cmsClasses from '@magenest/theme/BaseComponents/CMS/extendStyle/cms.module.scss';

const CMSPage = props => {
    const { identifier } = props;

    const talonProps = useCmsPage({ identifier });
    const { cmsPage, shouldShowLoadingIndicator } = talonProps;
    const classes = useStyle(defaultClasses, props.classes, cmsClasses);

    const { isLazyContent } = useContext(UserAgentContext);
    const isHomePage = location.pathname === "/";

    if (shouldShowLoadingIndicator) {
        return <div style={{height: 'calc(100vh - 156px)'}}></div>;
    }

    const {
        content_heading,
        title,
        meta_title,
        meta_description,
        page_layout,
        content
    } = cmsPage;

    const headingElement =
        content_heading !== '' ? (
            <h1 data-cy="Cms-contentHeading" className={classes.heading}>
                {content_heading}
            </h1>
        ) : null;

    const pageTitle = meta_title || title;
    const rootClassName = page_layout
        ? classes[`root_${toCamelCase(page_layout)}`]
        : classes.root;
    return (
        <Fragment>
            {isHomePage && (<HomeSchema />)}
            <StoreTitle>{pageTitle}</StoreTitle>
            <Meta name="title" content={pageTitle} />
            <Meta name="description" content={meta_description} />
            <article className={'cmsPage ' + rootClassName}>
                {headingElement}
                <RichContent html={content} />
                {
                    !isLazyContent && location.pathname === '/' && (
                        <SearchPopular/>
                    )
                }
            </article>
        </Fragment>
    );
};

CMSPage.propTypes = {
    identifier: string,
    classes: shape({
        root: string,
        heading: string,
        root_empty: string,
        root_1column: string,
        root_2columnsLeft: string,
        root_2columnsRight: string,
        root_3columns: string,
        root_cmsFullWidth: string,
        root_categoryFullWidth: string,
        root_productFullWidth: string
    })
};

export default CMSPage;
