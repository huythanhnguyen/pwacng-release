import React from 'react';
import { arrayOf, func, number, oneOfType, shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
import SuggestedProduct from './suggestedProduct';
import defaultClasses from '@magento/venia-ui/lib/components/SearchBar/suggestedProducts.module.css';
import suggestedProductsClasses from '@magenest/theme/BaseComponents/SearchBar/extendStyle/suggestedProducts.module.scss';

const SuggestedProducts = props => {
    const { limit, onNavigate, products, setVisible, searchValue } = props;
    const classes = useStyle(defaultClasses, suggestedProductsClasses, props.classes);

    const items = products && products.slice(0, limit).map(product => (
        <li key={product.id} className={classes.item}>
            <SuggestedProduct
                {...mapProduct(product)}
                onNavigate={onNavigate}
                product={product}
                setVisible={setVisible}
                searchValue={searchValue}
            />
        </li>
    ));

    return <ul className={classes.root}>{items}</ul>;
};

export default SuggestedProducts;

SuggestedProducts.defaultProps = {
    limit: 3
};

SuggestedProducts.propTypes = {
    classes: shape({
        item: string,
        root: string
    }),
    limit: number.isRequired,
    onNavigate: func,
    products: arrayOf(
        shape({
            id: oneOfType([number, string]).isRequired
        })
    ).isRequired
};
