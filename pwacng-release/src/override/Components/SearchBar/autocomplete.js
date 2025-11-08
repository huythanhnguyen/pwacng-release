import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { useAutocomplete } from '../../Talons/SearchBar/useAutocomplete';
import {FormattedMessage, useIntl} from 'react-intl';
import { ClockRotate, Close } from '@magenest/theme/static/icons';
import defaultClasses from '@magento/venia-ui/lib/components/SearchBar/autocomplete.module.css';
import autoCompleteClasses from '@magenest/theme/BaseComponents/SearchBar/extendStyle/autoComplete.module.scss';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Suggestions from './suggestions';
import SearchPopular from "@magenest/theme/BaseComponents/SearchBar/searchPopular";
import RichContent from "@magento/venia-ui/lib/components/RichContent/richContent";

const Autocomplete = props => {
    const { setVisible, valid, visible, setSkuRedirect } = props;
    const talonProps = useAutocomplete({
        valid,
        visible,
        setSkuRedirect
    });
    const {
        displayResult,
        filters,
        messageType,
        products,
        limit,
        resultCount,
        value,
        searchSuggestions,
        searchHistory,
        handleRemoveSearchHistory,
        handleSearch,
        handleRemoveAllHistory,
        categoryBlock,
        searchCategorySuggestions
    } = talonProps;

    const classes = useStyle(defaultClasses, autoCompleteClasses, props.classes);
    const rootClassName = visible ? classes.root_visible : classes.root_hidden;

    const { formatMessage } = useIntl();
    const MESSAGES = new Map()
        .set(
            'ERROR',
            formatMessage({
                id: 'autocomplete.error',
                defaultMessage: 'An error occurred while fetching results.'
            })
        )
        // .set(
        //     'LOADING',
        //     formatMessage({
        //         id: 'autocomplete.loading',
        //         defaultMessage: 'Fetching results...'
        //     })
        // )
        // .set(
        //     'PROMPT',
        //     formatMessage({
        //         id: 'autocomplete.prompt',
        //         defaultMessage: 'Search for a product'
        //     })
        // )
        .set(
            'EMPTY_RESULT',
            formatMessage({
                id: 'autocomplete.emptyResult',
                defaultMessage: 'No results were found.'
            })
        )
        // .set('RESULT_SUMMARY', (_, resultCount) =>
        //     formatMessage(
        //         {
        //             id: 'autocomplete.resultSummary',
        //             defaultMessage: '{resultCount} items'
        //         },
        //         { resultCount: resultCount }
        //     )
        // )
        // .set(
        //     'INVALID_CHARACTER_LENGTH',
        //     formatMessage({
        //         id: 'autocomplete.invalidCharacterLength',
        //         defaultMessage: 'Search term must be at least three characters'
        //     })
        // );

    const messageTpl = MESSAGES.get(messageType);
    const message =
        typeof messageTpl === 'function'
            ? messageTpl`${resultCount}`
            : messageTpl;

    return (
        <div data-cy="Autocomplete-root" className={classes.root}>
            <label
                id="search_query"
                data-cy="Autocomplete-message"
                className={classes.message}
            >
                {message}
            </label>
            {
                !displayResult && (
                    <>
                        {
                            searchHistory && searchHistory.length > 0 && (
                                <div className={classes.searchHistory}>
                                    <div data-cy="Suggestions-heading" className={classes.title}>
                                        <span>
                                            <FormattedMessage
                                                id={'searchHistory.title'}
                                                defaultMessage={'Search history'}
                                            />
                                        </span>
                                        <button
                                            type={'button'}
                                            className={classes.removeAllHistory}
                                            onClick={handleRemoveAllHistory}
                                        >
                                            <FormattedMessage
                                                id={'searchHistory.removeHistory'}
                                                defaultMessage={'Remove history'}
                                            />
                                        </button>
                                    </div>
                                    <div className={classes.searchHistoryList}>
                                        {
                                            searchHistory.slice(0, 5).map((item, index) => {
                                                return (
                                                    <div key={index} className={classes.searchHistoryItem}>
                                                        <img src={ClockRotate} alt={item} />
                                                        <span className={classes.value} onClick={() => handleSearch(item)}>
                                                            {item}
                                                        </span>
                                                        <button
                                                            type={'button'}
                                                            onClick={() => handleRemoveSearchHistory(item)}
                                                            className={classes.removeSearchHistory}
                                                        >
                                                            <img src={Close} alt={'remove'} />
                                                        </button>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        }
                        <div className={classes.searchSuggestion}>
                            <strong className={classes.title}>
                                <FormattedMessage
                                    id={'autoComplete.title'}
                                    defaultMessage={'Search keyword suggestions'}
                                />
                            </strong>
                            <SearchPopular
                                classes={classes}
                            />
                            {
                                categoryBlock && (
                                    <div className={classes.suggestionCategory}>
                                        <strong className={classes.title}>
                                            <FormattedMessage
                                                id={'header.menuButton'}
                                                defaultMessage={'Category'}
                                            />
                                        </strong>
                                        <div className={classes.sliders}>
                                            <RichContent html={categoryBlock} />
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </>
                )
            }
            <div className={classes.suggestions}>
                <Suggestions
                    limit={limit}
                    displayResult={displayResult}
                    products={products || {}}
                    filters={filters}
                    searchValue={value}
                    setVisible={setVisible}
                    visible={visible}
                    searchSuggestions={searchSuggestions}
                    handleSearch={handleSearch}
                    searchCategorySuggestions={searchCategorySuggestions}
                />
            </div>
        </div>
    );
};

export default Autocomplete;

Autocomplete.propTypes = {
    classes: shape({
        message: string,
        root_hidden: string,
        root_visible: string,
        suggestions: string
    }),
    setVisible: func,
    visible: bool
};
