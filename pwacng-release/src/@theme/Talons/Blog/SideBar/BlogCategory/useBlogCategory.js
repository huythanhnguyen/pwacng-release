import DEFAULT_OPERATIONS from '../sidebar.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useQuery} from "@apollo/client";

const UseBlogCategory = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);

    const {
        getBlogCategory
    } = operations;

    const { data, loading, error } = useQuery(getBlogCategory, {
        fetchPolicy: 'cache-and-network'
    });

    return {
        data: data?.blogCategory?.categories || []
    }
}

export default UseBlogCategory
