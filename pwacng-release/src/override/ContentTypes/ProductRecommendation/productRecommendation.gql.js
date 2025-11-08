import { gql } from '@apollo/client';
import { ProductFragment } from '../../Components/Product/productFragment.gql';

export const GET_PRODUCTS_RECOMMENDATION = gql`
    query getProductRecommendation(
        $asmUid: String,
        $asmJourneyId: String,
        $pageSize: Int!
        $dims: DimsInput,
        $items: ItemsInput
        $extra: ExtraInput,
        $ec: String,
        $ea: String,
    ) {
        productsV2(
            filter: { url_key: { in: "" }},
            asm_uid: $asmUid,
            is_product_recommendation: true,
            asm_journey_id:$asmJourneyId,
            ec: $ec,
            ea: $ea,
            portal_id: "564892373",
            prop_id: "565018647",
            dims: $dims,
            items: $items,
            extra: $extra,
            currentPage: 1,
            pageSize: $pageSize
        ) {
            globalTracking {
                view
                impression
                atmTrackingParameters
            }
            aggregations {
                label
                count
                attribute_code
                options {
                    label
                    value
                }
                position
            }
            items {
                ...ProductFragment
                tracking_click_url
            }
            page_info {
                total_pages
            }
            total_count
        }
    }
    ${ProductFragment}
`;

export default GET_PRODUCTS_RECOMMENDATION;
