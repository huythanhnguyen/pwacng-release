import React from "react";
import defaultClasses from './blogSearchPage.module.scss';
import BlogItems from "../BlogItems/blogItems";
import {useStyle} from "@magento/venia-ui/lib/classify";
import useBlogSearchPage from "../../../Talons/Blog/BlogSearchPage/useBlogSearchPage";
import StaticBreadcrumbs from "../../../../override/Components/Breadcrumbs/staticBreadcrumbs";
import {FormattedMessage, useIntl} from "react-intl";
import Pagination from "@magento/venia-ui/lib/components/Pagination";
import SearchBar from "../SideBar/SearchBar/searchBar";
import useMediaCheck from "../../../Hooks/MediaCheck/useMediaCheck";
import {fullPageLoadingIndicator} from "@magento/venia-ui/lib/components/LoadingIndicator";

const BlogSearchPage = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const {isMobile } = useMediaCheck();

    const talonProps = useBlogSearchPage();

    const {
        items,
        breadcrumbTitle,
        pageTitle,
        totalPagesFromData,
        pageControl,
        isLoading,
        searchQuery
    } = talonProps;

    const pagination = totalPagesFromData ? (
        <Pagination pageControl={pageControl} />
    ) : null;

    if (isLoading) {
        return fullPageLoadingIndicator
    }

    return (
        <div className={classes.root}>
            {
                items.length > 0 ? (
                    <>
                        <div className={classes.breadcrumbs}>
                            <StaticBreadcrumbs isBlog={true} pageTitle={breadcrumbTitle} />
                        </div>
                        {
                            isMobile && (
                                <div className={classes.searchBar}>
                                    <SearchBar />
                                </div>
                            )
                        }
                        <h1 className={classes.title}>
                            {pageTitle}
                        </h1>
                        <BlogItems
                            data={items}
                        />
                        <div className={classes.pagination}>
                            {pagination}
                        </div>
                    </>
                ) : (
                    <div className={classes.emptyWrapper}>
                        <p className={classes.emptyTitle}>
                            <FormattedMessage
                                id={'searchEmpty.title'}
                                defaultMessage={'No results found for <strong>"{value}"</strong>'}
                                values={{
                                    strong: chunks => (
                                        <strong>{chunks}</strong>
                                    ),
                                    value: searchQuery
                                }}
                            />
                        </p>
                    </div>
                )
            }
        </div>
    )
}

export default BlogSearchPage
