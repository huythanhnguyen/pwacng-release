import DEFAULT_OPERATIONS from './blogSearchPage.gql';
import SIDEBAR_OPERATIONS from '../SideBar/sidebar.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useLazyQuery, useQuery} from "@apollo/client";
import {useLocation} from "react-router-dom";
import {useEffect, useMemo} from "react";
import {usePagination} from "@magento/peregrine/lib/hooks/usePagination";
import {useIntl} from "react-intl";

const UseBlogSearchPage = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, SIDEBAR_OPERATIONS);

    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const search_query = query.get('blog_search') || "";
    const date_query = query.get('date') || "";
    const categoryId_query = query.get('categoryId') || "";
    const [paginationValues, paginationApi] = usePagination();
    const { currentPage, totalPages } = paginationValues;
    const { setCurrentPage, setTotalPages } = paginationApi;
    const { formatMessage } = useIntl();

    const {
        getSearchNews,
        getBlogCategory,
        getArchivedBlog
    } = operations

    const [runQuery, { data, loading, error }] = useLazyQuery(getSearchNews, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: blogCategoryData, loading: blogCategoryLoading, error: blogCategoryError } = useQuery(getBlogCategory, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: blogCategoryDateData, loading: blogCategoryDateLoading, error: blogCategoryDateError } = useQuery(getArchivedBlog, {
        fetchPolicy: 'cache-and-network'
    });

    const totalPagesFromData = data?.searchNews?.page_info?.total_pages || null;

    useEffect(() => {
        setTotalPages(totalPagesFromData);
        return () => {
            setTotalPages(null);
        };
    }, [setTotalPages, totalPagesFromData]);

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages
    };

    const breadcrumbTitle = useMemo(() => {
        if (categoryId_query) {
            return blogCategoryData?.blogCategory?.categories?.find(item => item.id === categoryId_query)?.name || ''
        } else if (date_query) {
            return blogCategoryDateData?.archivedBlog?.archived_blogs?.find(item => item.date === date_query)?.name || ''
        } else {
            return `${formatMessage({
                id: 'blogSearchPage.breadcrumbTitle',
                defaultMessage: 'Search'
            })} "${search_query}"`
        }
    }, [search_query, categoryId_query]);

    const pageTitle = useMemo(() => {
        if (categoryId_query) {
            return blogCategoryData?.blogCategory?.categories?.find(item => item.id === categoryId_query)?.name || ''
        } else if (date_query) {
            return `${formatMessage({
                id: 'blogSearchPage.categoryDateTitle',
                defaultMessage: 'Articles of the month'
            })}: ${blogCategoryDateData?.archivedBlog?.archived_blogs?.find(item => item.date === date_query)?.name || ''}`
        } else {
            return `${formatMessage({
                id: 'blogSearchPage.pageTitle',
                defaultMessage: 'Search result'
            })} "${search_query}"`
        }
    }, [search_query, categoryId_query])

    useEffect(() => {
        runQuery({
            variables: {
                search: search_query,
                date: date_query,
                categoryId: categoryId_query,
                currentPage: Number(currentPage),
                pageSize: 12
            }
        })
    }, [search_query, date_query, categoryId_query, currentPage]);

    return {
        isLoading: loading,
        pageControl,
        items: data?.searchNews?.items || [],
        breadcrumbTitle,
        pageTitle,
        totalPagesFromData,
        searchQuery: search_query
    }
}

export default UseBlogSearchPage
