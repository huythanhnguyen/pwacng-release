import {useCallback} from "react";
import {useHistory} from "react-router-dom";

const UseSearchBar = props => {
    const history = useHistory();
    const { push } = history;

    const handleSubmit = useCallback(({search_query}) => {
        if (search_query != null && search_query.trim().length > 0) {
            push(`/blog-search?blog_search=${search_query}`);
        }
    }, []);

    return {
        handleSubmit
    }
}

export default UseSearchBar
