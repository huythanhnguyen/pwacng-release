import React, { Fragment } from 'react';
import { string } from 'prop-types';
import { useProductFrame } from './useProductFrame';

import ErrorView from '@magento/venia-ui/lib/components/ErrorView';
import ProductFullDetail from '@magento/venia-ui/lib/components/ProductFullDetail';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
import ProductShimmer from '@magento/venia-ui/lib/RootComponents/Product/product.shimmer';
import {FormattedMessage} from "react-intl";

/*
 * As of this writing, there is no single Product query type in the M2.3 schema.
 * The recommended solution is to use filter criteria on a Products query.
 * However, the `id` argument is not supported. See
 * https://github.com/magento/graphql-ce/issues/86
 * TODO: Replace with a single product query when possible.
 */

const ProductFrame = props => {
    const {
        classes,
        pathname,
        handleChatbotOpened,
        handleSaveToStorage,
        setSignInRedirect
    } = props;
    const talonProps = useProductFrame({
        mapProduct,
        pathname
    });

    const { error, loading, product } = talonProps;

    if (loading && !product)
        return <ProductShimmer productType={'SimpleProduct'} />;
    if (error && !product) return <ErrorView />;
    if (!product) {
        return (
            <div className={classes.productFrameEmpty}>
                <FormattedMessage
                    id={'productFrame.noProduct'}
                    defaultMessage={'No product found in the respective store'}
                />
            </div>
        );
    }

    return (
        <Fragment>
            {
                !!pathname && (
                    <ProductFullDetail
                        product={product}
                        productFrame={true}
                        handleChatbotOpened={handleChatbotOpened}
                        handleSaveToStorage={handleSaveToStorage}
                        setSignInRedirect={setSignInRedirect}
                    />
                )
            }
        </Fragment>
    );
};

export default ProductFrame;
