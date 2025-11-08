import {useLazyQuery} from "@apollo/client";
import { GET_FAQS_QUERY } from './faqPage.gql';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useEffect, useMemo, useState} from "react";

const UseFaqPage = props => {
    const {
        isMobile
    } = props;
    const storage = new BrowserPersistence();
    const storeView = storage.getItem('store_view_code');
    const childPage = window.location.pathname.split('/').length > 2 ? window.location.pathname.split('/').pop() : '';
    const [ currentFaq, setCurrentFaq ] = useState(isMobile ? '' : '1');

    const [runQuery, { data, error, loading }] = useLazyQuery(GET_FAQS_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    useEffect(() => {
        runQuery({
            variables: {
                storeView,
                identifier: childPage
            }
        })
    }, [storeView, childPage]);

    const faqsAvailable = useMemo(() => {
        return data?.faqs ? data.faqs.filter(item => item.is_active === 1) : [];
    }, [data]);

    useEffect(() => {
        if (childPage && faqsAvailable && faqsAvailable.length > 0) {
            setCurrentFaq(faqsAvailable[0].category_id)
        }
    }, [childPage, faqsAvailable]);

    return {
        data: faqsAvailable,
        headerContent: data?.faqs?.content_html_page_header,
        footerContent: data?.faqs?.content_html_page_footer,
        currentFaq,
        setCurrentFaq,
        childPage
    }
}

export default UseFaqPage
