import DEFAULT_OPERATIONS from '../sidebar.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useQuery} from "@apollo/client";

const UseBlogCategoryDate = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);

    const {
        getArchivedBlog
    } = operations;

    const { data, loading, error } = useQuery(getArchivedBlog, {
        fetchPolicy: 'cache-and-network'
    });

    return {
        data: data?.archivedBlog?.archived_blogs || []
    }
}

export default UseBlogCategoryDate
