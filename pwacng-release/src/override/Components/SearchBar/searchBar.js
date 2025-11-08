import React, {useCallback, useRef, useState} from 'react';
import { bool, shape, string } from 'prop-types';
import { Form } from 'informed';
import {FormattedMessage, useIntl} from 'react-intl';
import { useSearchBar } from '../../Talons/SearchBar/useSearchBar';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Autocomplete from './autocomplete';
import SearchField from './searchField';
import defaultClasses from '@magento/venia-ui/lib/components/SearchBar/searchBar.module.css';
import searchBarCustomClasses from "@magenest/theme/BaseComponents/SearchBar/extendStyle/searchBar.module.scss";
import SearchMultiple from "@magenest/theme/BaseComponents/SearchBar/searchMultiple";
import SearchMultipleDialog from "@magenest/theme/BaseComponents/SearchBar/searchMultipleDialog";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {Link} from "react-router-dom";
import SearchAIByImage from "@magenest/theme/BaseComponents/SearchAI/searchAIByImage";
import SearchAIByVoice from "@magenest/theme/BaseComponents/SearchAI/searchAIByVoice";

const searchMultipleEnable = false;

const SearchBar = React.forwardRef((props, ref) => {
    const { isOpen } = props;
    const talonProps = useSearchBar();
    const {
        containerRef,
        handleChange,
        handleFocus,
        handleSubmit,
        initialValues,
        isAutoCompleteOpen,
        setIsAutoCompleteOpen,
        valid,
        inputRef,
        setSkuRedirect
    } = talonProps;

    const classes = useStyle(defaultClasses, searchBarCustomClasses, props.classes);
    const rootClassName = isAutoCompleteOpen ? classes.autocomplete_visible : classes.autocomplete_hidden;
    const { formatMessage } = useIntl();
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const [isSearchMultipleOpen, setIsSearchMultipleOpen] = useState(false);
    const [isSearchImageOpen, setIsSearchImageOpen] = useState(false);
    const [isSearchVoiceOpen, setIsSearchVoiceOpen] = useState(false);

    const searchAIWrapperRef = useRef(null);

    const handleOpenSearchImage = useCallback(() => {
        setIsAutoCompleteOpen(false);
        setIsSearchMultipleOpen(false);
        closeDrawer();
        setIsSearchVoiceOpen(false);
        setIsSearchImageOpen(true);
    }, [toggleDrawer]);

    const handleOpenSearchVoice = useCallback(() => {
        setIsAutoCompleteOpen(false);
        setIsSearchMultipleOpen(false);
        closeDrawer();
        setIsSearchImageOpen(false);
        setIsSearchVoiceOpen(true);
    }, [toggleDrawer]);

    const handleOpenSearchAI = useCallback(() => {
        setIsAutoCompleteOpen(false);
        setIsSearchMultipleOpen(false);
    }, [closeDrawer]);

    const handleCloseSearchAI = useCallback(() => {
        setIsSearchImageOpen(false);
        setIsSearchVoiceOpen(false);
    }, [closeDrawer]);

    return (
        <div className={(isSearchImageOpen || isSearchVoiceOpen) ? `${classes.searchBarRoot} ${classes.searchAIRoot}` : classes.searchBarRoot} data-cy="SearchBar-root" ref={ref}>
            <div ref={containerRef} className={classes.container}>
                <Form
                    autoComplete="off"
                    className={classes.form}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    <div className={`${classes.search} ${isAutoCompleteOpen ? classes.searchOpen : ''}`}>
                        <div className={classes.inputSearch}>
                            <SearchField
                                addLabel={formatMessage({
                                    id: 'global.clearText',
                                    defaultMessage: 'Clear Text'
                                })}
                                isSearchOpen={isOpen}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                classes={classes}
                                placeholder={formatMessage({
                                    id: 'searchBar.placeholder',
                                    defaultMessage: 'What are you looking for?'
                                })}
                                inputRef={inputRef}
                            />
                            <div ref={searchAIWrapperRef} className={classes.searchAIWrapper}>
                                <button
                                    type='button'
                                    className={classes.searchByImage}
                                    title={formatMessage({
                                        id: 'searchBar.searchByImage',
                                        defaultMessage: 'Search by image'
                                    })}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleOpenSearchImage()
                                    }}
                                >
                                    <span>{'Search by image'}</span>
                                </button>
                                <Link className={classes.searchAITrigger} to={`/search-ai`}
                                      onClick={handleOpenSearchAI}
                                >
                                    <span>{'AI Mode'}</span>
                                </Link>
                            </div>
                        </div>
                        <div className={rootClassName}>
                            <Link className={classes.searchAIMobile} to={`/search-ai`}
                                  onClick={handleOpenSearchAI}
                            >
                                <span>
                                    <FormattedMessage
                                        id={'searchAIImage.textMobile'}
                                        defaultMessage={'What is your menu today?'}
                                    />
                                </span>
                            </Link>
                            {searchMultipleEnable && (
                                <SearchMultiple
                                    setIsAutoCompleteOpen={setIsAutoCompleteOpen}
                                    setIsOpen={setIsSearchMultipleOpen}
                                />
                            )}
                            <Autocomplete
                                visible={isAutoCompleteOpen}
                                setVisible={setIsAutoCompleteOpen}
                                valid={valid}
                                setSkuRedirect={setSkuRedirect}
                            />
                        </div>
                    </div>
                </Form>
            </div>
            <SearchAIByVoice
                isSearchVoiceOpen={isSearchVoiceOpen}
                handleOpenSearchVoice={handleOpenSearchVoice}
                handleCloseSearchAI={handleCloseSearchAI}
                triggerRef={searchAIWrapperRef}
            />
            {searchMultipleEnable && (
                <SearchMultipleDialog
                    isOpen={isSearchMultipleOpen}
                    setIsOpen={setIsSearchMultipleOpen}
                />
            )}
            {isSearchImageOpen && (
                <SearchAIByImage handleCloseSearchAI={handleCloseSearchAI}/>
            )}
        </div>
    );
});

export default SearchBar;

SearchBar.propTypes = {
    classes: shape({
        autocomplete: string,
        container: string,
        form: string,
        root: string,
        root_open: string,
        search: string
    }),
    isOpen: bool
};
