import DEFAULT_OPERATIONS from '../../blog.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useQuery} from "@apollo/client";
const UseLastArticle = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);

    const {
        getLastArticle
    } = operations

    const { data, loading, error } = useQuery(getLastArticle, {
        fetchPolicy: 'cache-and-network',
        variables: {
            sort: {
                field: "publish_date",
                direction: "DESC"
            },
            currentPage: 1,
            pageSize: 4
        }
    });

    return {
        data: data?.blogList?.items || []
    }
}

export default UseLastArticle
