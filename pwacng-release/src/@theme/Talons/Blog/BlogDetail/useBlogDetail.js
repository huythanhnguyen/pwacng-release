import {useMutation, useQuery} from "@apollo/client";
import DEFAULT_OPERATIONS from './blogDetail.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";

const UseBlogDetail = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const {
        getBlogDetail,
        increaseBlogView
    } = operations;
    const location = useLocation();
    const { pathname } = location;
    const urlKey = pathname.split('/blog/')[1];
    const [ isIncreaseView, setIsIncreaseView ] = useState(true);

    const { data, loading, error } = useQuery(getBlogDetail, {
        variables: {
            urlKey
        },
        fetchPolicy: 'cache-and-network'
    });

    const [ fetchIncreaseBlogView ] = useMutation(increaseBlogView);

    useEffect(() => {
        const handleScroll = async () => {
            const windowHeight = window.innerHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const docHeight = document.body.scrollHeight;

            if (windowHeight + scrollTop >= docHeight - 1000 && isIncreaseView) {
                setIsIncreaseView(false);

                await fetchIncreaseBlogView({
                    variables: {
                        urlKey: urlKey
                    }
                })
            }
        };

        if (!loading) {
            window.addEventListener("scroll", handleScroll);
        }

        // Cleanup khi component unmount
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [loading, isIncreaseView]);

    return {
        data: data?.blogList?.items[0],
        loading
    }
}

export default UseBlogDetail
