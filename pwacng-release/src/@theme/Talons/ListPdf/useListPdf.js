import {useQuery} from "@apollo/client";
import {LIST_PDF_QUERY} from "./listPdf.gql";

const UseListPdf = props => {
    const {
        categoryId = null,
        currentPage = 1,
        pageSize = 5
    } = props;

    const { data, loading, error } = useQuery(LIST_PDF_QUERY, {
        variables: {
            categoryId,
            currentPage,
            pageSize
        },
        fetchPolicy: 'cache-and-network'
    })

    return {
        data: data?.listPdf || [],
        loading,
        error
    }
}

export default UseListPdf
