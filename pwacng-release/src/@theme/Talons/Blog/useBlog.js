import DEFAULT_OPERATIONS from './blog.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useLazyQuery, useQuery} from "@apollo/client";
import {usePagination} from "@magento/peregrine/lib/hooks/usePagination";
import {useEffect} from "react";
import {getFilterInput, getFiltersFromSearch} from "@magento/peregrine/lib/talons/FilterModal/helpers";

const UseBlog = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const [paginationValues, paginationApi] = usePagination();
    const { currentPage, totalPages } = paginationValues;
    const { setCurrentPage, setTotalPages } = paginationApi;

    const {
        getBlogList
    } = operations;

    const [runQuery, { data, loading, error }] = useLazyQuery(getBlogList, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const totalPagesFromData = data
        ? data.blogList.page_info.total_pages
        : null;

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

    useEffect(() => {
        runQuery({
            variables: {
                sort: {
                    field: "publish_date",
                    direction: "DESC"
                },
                currentPage: Number(currentPage),
                pageSize: 12
            }
        });
    }, [
        currentPage,
        runQuery
    ]);

    return {
        totalPagesFromData,
        items: data?.blogList?.items || [],
        pageControl
    }
}

export default UseBlog
