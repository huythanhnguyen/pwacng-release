import {useQuery} from "@apollo/client";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import defaultOperations from "./quickOrder.gql";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useEffect} from "react";
import {useHistory} from "react-router-dom";
import {useToasts} from "@magento/peregrine";
import {useIntl} from "react-intl";

const UseQuickOrder = props => {
    const operations = mergeOperations(defaultOperations);
    const {
        getQuickOrder
    } = operations;
    const [{ isSignedIn }] = useUserContext();
    const history = useHistory();
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    useEffect(() => {
        if (!isSignedIn) {
            history.push('/');

            addToast({
                type: 'info',
                message: formatMessage({
                    id: 'quickOrder.messageNotLogin',
                    defaultMessage: 'You need to log in to use this feature.'
                }),
                timeout: 5000
            });
        }
    }, [isSignedIn]);

    const { data } = useQuery(getQuickOrder, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const totalPrice = data?.getQuickOrder?.items.reduce((accumulator, currentValue) =>
        accumulator + (currentValue.product.price_range.maximum_price.final_price.value * currentValue.qty), 0) || 0

    return {
        data,
        totalPrice
    }
}

export default UseQuickOrder
