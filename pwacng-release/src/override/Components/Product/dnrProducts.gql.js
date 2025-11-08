import { gql } from '@apollo/client';

const DNR_PRODUCTS = gql`
    query products($sku: String!) {
        products(
            filter: {
                sku: {
                    eq: $sku
                }
            }
        ) {
            items {
                sku
                __typename
                uid
                dnr_promotion {
                    great_deal {
                        price
                        old_price
                        product {
                            uid
                            art_no
                            sku
                            name
                            ecom_name
                            mm_product_type
                            small_image {
                                url
                            }
                            url_key
                            canonical_url
                        }
                    }
                    free_gift {
                        price
                        old_price
                        product {
                            uid
                            sku
                            name
                            ecom_name
                            small_image {
                                url
                            }
                            url_key
                            canonical_url
                        }
                    }
                    same_promotion {
                        price
                        old_price
                        product {
                            uid
                            sku
                            name
                            ecom_name
                            small_image {
                                url
                            }
                            url_key
                            canonical_url
                        }
                    }
                }
            }
        }
    }
`;
export default DNR_PRODUCTS;
