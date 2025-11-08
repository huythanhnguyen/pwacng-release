import React from "react";
import defaultClasses from './blog.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import StaticBreadcrumbs from "../../../override/Components/Breadcrumbs/staticBreadcrumbs";
import {useIntl} from "react-intl";
import BlogItems from "./BlogItems/blogItems";
import Sidebar from "./SideBar/sidebar";
import useBlog from "../../Talons/Blog/useBlog";
import Pagination from "@magento/venia-ui/lib/components/Pagination";
import SearchBar from "./SideBar/SearchBar/searchBar";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";

const Blog = () => {
    const classes = useStyle(defaultClasses);
    const { formatMessage } = useIntl();
    const {isMobile } = useMediaCheck();

    const talonProps = useBlog();

    const {
        totalPagesFromData,
        items,
        pageControl
    } = talonProps;

    const pagination = totalPagesFromData ? (
        <Pagination pageControl={pageControl} />
    ) : null;

    return (
        <div className={classes.root}>
            <div className={classes.breadcrumbs}>
                <StaticBreadcrumbs pageTitle={
                    formatMessage(
                        {
                            id: "global.blog",
                            defaultMessage: 'Blog'
                        }
                    )
                } />
            </div>
            <div className={classes.wrapper}>
                <div className={classes.main}>
                    {
                        isMobile && (
                            <div className={classes.searchBar}>
                                <SearchBar />
                            </div>
                        )
                    }
                    <BlogItems
                        data={items}
                    />
                    <div className={classes.pagination}>
                        {pagination}
                    </div>
                </div>
                <Sidebar />
            </div>
        </div>
    )
}

export default Blog
