import React, {useState} from "react";
import { useQuery } from '@apollo/client';
import {GET_PRODUCTS_BY_SKU} from "../Product/products.gql";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";

const useProducts = props => {
    const {
        skus,
        keywords,
        setFullscreen,
        setProductKeywords,
        setShowProducts,
        handleShowFrame
    } = props;

    const { isMobile } = useMediaCheck();

    const [showSliderMobile, setShowSliderMobile] = useState(false);
    const [keywordsCurrentData, setKeywordsCurrentData] = useState(null);
    const [showProductsCurrentData, setShowProductsCurrentData] = useState([]);

    const { data, loading } = useQuery(GET_PRODUCTS_BY_SKU, {
        variables: { skus, pageSize: 20 },
        skip: !skus?.length,
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first"
    });

    const items = (data && data.products && data.products.items) ? data.products.items : [];

    const handleOpenMore = (itemsFromGQL) => {
        handleShowFrame(null);
        // 1) Lấy keywords theo cùng invocationId
        const pairs = (keywords?.pairs || []).filter(p => p?.query && p?.data);
        const queriesSet = new Set(pairs.map(p => p.query));
        const queries = (keywords?.queries || []).filter(q => queriesSet.has(q));

        // 2) Query đầu tiên (nếu có)
        const firstQuery = (queries.length > 0) ? String(queries[0]) : null;

        // 3) Lấy data sản phẩm map theo query đầu tiên
        let firstQueryProducts = null;
        if (firstQuery) {
            const matched = pairs.find(p => p && p.query === firstQuery);
            if (matched && Array.isArray(matched.data)) {
                firstQueryProducts = matched.data;
            }
        }

        // Show first items from first query; fallback GQL
        const productsForFullscreen = (firstQueryProducts && firstQueryProducts.length > 0)
            ? firstQueryProducts
            : itemsFromGQL;

        // Đẩy đầy đủ { queries, pairs } lên parent để parent xử lý click keywords
        if (isMobile) {
            setKeywordsCurrentData({ queries, pairs });
            setShowProductsCurrentData(productsForFullscreen);
            setShowSliderMobile(true);
        } else {
            setProductKeywords({ queries, pairs });
            setShowProducts(productsForFullscreen);
            setFullscreen(true);
        }
    };

    return {
        isMobile,
        itemsLoading: loading,
        suggestItems: items,
        showSliderMobile,
        setShowSliderMobile,
        keywordsCurrentData,
        showProductsCurrentData,
        setShowProductsCurrentData,
        setKeywordsCurrentData,
        handleOpenMore
    };
};

export default useProducts;
