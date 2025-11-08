import React from 'react';
import { func } from 'prop-types';
import { Search as SearchIcon, X as ClearIcon } from 'react-feather';
import { useSearchField } from '../../Talons/SearchBar/useSearchField';

import Icon from '@magento/venia-ui/lib/components/Icon';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import Trigger from '@magento/venia-ui/lib/components/Trigger';
import {useStyle} from "@magento/venia-ui/lib/classify";
import { Search } from '@magenest/theme/static/icons'

const SearchField = props => {
    const { isSearchOpen, onChange, onFocus, addLabel, placeholder, inputRef } = props;
    const { resetForm, value } = useSearchField({ isSearchOpen });
    const classes = useStyle(props.classes);

    const clearIcon = <Icon src={ClearIcon} size={24} />;
    const searchIcon = <button type={'submit'} aria-label="Search"></button>;

    const resetButton = value ? (
        <Trigger action={resetForm} addLabel={addLabel}>
            {clearIcon}
        </Trigger>
    ) : null;

    return (
        <TextInput
            id="search_query"
            // after={resetButton}
            before={searchIcon}
            field="search_query"
            data-cy="SearchField-textInput"
            onFocus={onFocus}
            onValueChange={onChange}
            forwardedRef={inputRef}
            classes={props.classes}
            placeholder={placeholder}
        />
    );
};

export default SearchField;

SearchField.propTypes = {
    onChange: func,
    onFocus: func
};
