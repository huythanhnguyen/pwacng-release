import React from "react";
import defaultClasses from './searchBar.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import TextInput from "../../../../../override/Components/TextInput/textInput";
import Field from "../../../../../override/Components/Field/field";
import {Form} from "informed";
import useSearchBar from "../../../../Talons/Blog/SideBar/SearchBar/useSearchBar";
import {useIntl} from "react-intl";
import { Search as SearchIcon, X as ClearIcon } from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";


const SearchBar = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const searchIcon = <button type={'submit'} aria-label="Search"></button>;

    const talonProps = useSearchBar();

    const {
        handleSubmit
    } = talonProps;

    return (
        <div className={classes.root}>
            <Form onSubmit={handleSubmit}>
                <TextInput
                    field={'search_query'}
                    placeholder={formatMessage({
                        id: 'global.searchArticles',
                        defaultMessage: 'Search articles'
                    })}
                    before={searchIcon}
                    classes={classes}
                />
            </Form>
        </div>
    )
}

export default SearchBar
