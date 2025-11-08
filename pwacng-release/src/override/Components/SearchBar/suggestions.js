import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { useSuggestions } from '@magento/peregrine/lib/talons/SearchBar';

import { useStyle } from '@magento/venia-ui/lib/classify';
import SuggestedCategories from '@magento/venia-ui/lib/components/SearchBar/suggestedCategories';
import SuggestedProducts from '@magento/venia-ui/lib/components/SearchBar/suggestedProducts';
import defaultClasses from '@magento/venia-ui/lib/components/SearchBar/suggestions.module.css';
import suggestionsCustomClasses from '@magenest/theme/BaseComponents/SearchBar/extendStyle/suggestions.module.scss'

const Suggestions = props => {
    const {
        displayResult,
        filters,
        products,
        limit,
        searchValue,
        setVisible,
        visible,
        searchSuggestions,
        handleSearch,
        searchCategorySuggestions
    } = props;
    const { items } = products;

    const talonProps = useSuggestions({
        displayResult,
        filters,
        items,
        setVisible,
        visible
    });
    const { categories, onNavigate, shouldRender } = talonProps;
    const classes = useStyle(defaultClasses, suggestionsCustomClasses, props.classes);

    // render null without data
    if (!shouldRender) {
        return null;
    }

    return (
        <Fragment>
            <SuggestedCategories
                categories={searchCategorySuggestions}
                onNavigate={onNavigate}
                value={searchValue}
                setVisible={setVisible}
            />
            <strong data-cy="Suggestions-heading" className={classes.title}>
                <FormattedMessage
                    id={'suggestions.title'}
                    defaultMessage={'Results for "{searchValue}"'}
                    values={{searchValue}}
                />
            </strong>
            {
                searchSuggestions?.length > 0 && (
                    <div className={classes.searchSuggestions}>
                        {
                            searchSuggestions.map((item, index) => {
                                return item.type === 'term' ? (
                                    <span key={index} onClick={() => handleSearch(item.title)}
                                          className={classes.searchSuggestion}>
                                {item.title}
                            </span>
                                ) : null
                            })
                        }
                    </div>
                )
            }
            <SuggestedProducts
                onNavigate={onNavigate}
                products={items}
                limit={limit}
                setVisible={setVisible}
                searchValue={searchValue}
            />
        </Fragment>
    );
};

export default Suggestions;

Suggestions.propTypes = {
    classes: shape({
        heading: string
    }),
    products: shape({
        filters: arrayOf(
            shape({
                filter_items: arrayOf(shape({})),
                name: string.isRequired
            }).isRequired
        ),
        items: arrayOf(shape({}))
    }),
    searchValue: string,
    setVisible: func,
    visible: bool
};
