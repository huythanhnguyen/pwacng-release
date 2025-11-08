import React from 'react';
import defaultClasses from './blogDetailPage.module.scss';
import StaticBreadcrumbs from "../../../../override/Components/Breadcrumbs/staticBreadcrumbs";
import Sidebar from "../SideBar/sidebar";
import {useStyle} from "@magento/venia-ui/lib/classify";
import {useIntl} from "react-intl";
import BlogDetail from "../BlogDetail/blogDetail";
import SearchBar from "../SideBar/SearchBar/searchBar";
import useMediaCheck from "../../../Hooks/MediaCheck/useMediaCheck";
import useBlogDetail from "../../../Talons/Blog/BlogDetail/useBlogDetail";
import {Meta, Title} from "@magento/venia-ui/lib/components/Head";

const BlogDetailPage = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const {isMobile } = useMediaCheck();

    const talonProps = useBlogDetail();

    const {
        data,
        loading
    } = talonProps;

    return (
        <div className={classes.root}>
            <Title>{data?.meta_title || data?.title || ''}</Title>
            <Meta name="title" content={data?.meta_title || data?.title || ''} />
            { data?.meta_description && <Meta name="description" content={data.meta_description} /> }
            { data?.meta_keywords && <Meta name="keywords" content={data.meta_keywords} /> }
            <Meta property="og:title" content={data?.meta_title || data?.title || ''} />
            { data?.meta_description && <Meta property="og:description" content={data.meta_description} /> }
            { data?.image && <Meta property="og:image" content={data.image} /> }
            <Meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
            <Meta property="og:type" content={'article'} />
            <div className={classes.breadcrumbs}>
                <StaticBreadcrumbs isBlog pageTitle={data?.title || ''} />
            </div>
            <div className={classes.wrapper}>
                {
                    isMobile && (
                        <div className={classes.searchBar}>
                            <SearchBar />
                        </div>
                    )
                }
                <div className={classes.main}>
                    <BlogDetail
                        data={data}
                        loading={loading}
                    />
                </div>
                <Sidebar />
            </div>
        </div>
    )
}

export default BlogDetailPage
