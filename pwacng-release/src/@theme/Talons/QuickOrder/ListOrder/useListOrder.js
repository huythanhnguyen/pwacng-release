import {useCallback, useMemo} from "react";
import defaultOperations from '../quickOrder.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useQuery} from "@apollo/client";

const UseListOrder = props => {
    const operations = mergeOperations(defaultOperations);
    const {
        getStoreConfig
    } = operations;

    const { data: storeConfigData } = useQuery(getStoreConfig, {
        fetchPolicy: 'cache-and-network'
    });

    const storeUrlSuffix = useMemo(() => {
        if (storeConfigData) {
            return storeConfigData.storeConfig.product_url_suffix;
        }
    }, [storeConfigData]);

    const isProductUpdating = useMemo(() => {
        // if (updateItemCalled || removeItemCalled) {
        //     return removeItemLoading || updateItemLoading;
        // } else {
        //     return false;
        // }
    }, [

    ]);

    return {
        isProductUpdating,
        commentMaxLength: Number(storeConfigData?.storeConfig?.commentMaxLength || 100),
        storeUrlSuffix
    }
}

export default UseListOrder
