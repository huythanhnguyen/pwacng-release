import React from 'react';
import {Helmet} from 'react-helmet-async';
import {useQuery} from '@apollo/client';
import {GET_BREADCRUMBS} from '@magento/peregrine/lib/talons/Breadcrumbs/breadcrumbs.gql';

const ProductSchema = props => {
    const {
        breadcrumbCategoryId,
        productDetails,
        product,
        brandName,
        isOutOfStock
    } = props;
    const {data} = useQuery(GET_BREADCRUMBS, {
        variables: {category_id: breadcrumbCategoryId},
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !breadcrumbCategoryId
    });

    const breadcrumbsTree = data?.categories?.items?.[0]?.breadcrumbs;
    const breadcrumbList = data ? [
        {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: window.location.origin
        },
        ...(Array.isArray(breadcrumbsTree) ? breadcrumbsTree.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 2,
            "name": item.category_name,
            "item": `${window.location.origin}/${item.category_url_path}`
        })) : []),
        {
            "@type": "ListItem",
            position: (data?.categories?.items?.[0]?.breadcrumbs?.length || 0) + 2,
            name: data?.categories?.items?.[0]?.name,
            item: `${window.location.origin}/${data?.categories?.items?.[0]?.url_path}`
        },
        {
            "@type": "ListItem",
            position: (data?.categories?.items?.[0]?.breadcrumbs?.length || 0) + 3,
            name: productDetails.name,
            item: window.location.href
        }
    ] : null;

    const priceValidUntil = new Date();
    priceValidUntil.setDate(priceValidUntil.getDate() + 14);
    const formattedPriceValidUntil = priceValidUntil.toISOString().split('T')[0];

    const offers = {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: productDetails.price.currency,
        price: productDetails.price.value,
        priceValidUntil: formattedPriceValidUntil,
        itemCondition: 'https://schema.org/NewCondition',
        availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org/',
                    '@type': 'Product',
                    name: productDetails.name,
                    image: product.small_image,
                    description: productDetails.description.html ? productDetails.name : '',
                    sku: productDetails.sku,
                    brand: {
                        '@type': 'Brand',
                        name: brandName
                    },
                    offers: offers,
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: 5,
                        reviewCount: 10
                    }
                })}
            </script>
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: breadcrumbList
                })}
            </script>
        </Helmet>
    );
};

export default ProductSchema;
