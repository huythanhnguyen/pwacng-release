import React from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchMultiple.module.scss';
import {FormattedMessage} from "react-intl";

const SearchMultiple = props => {
    const {setIsAutoCompleteOpen, setIsOpen} = props;
    const classes = useStyle(defaultClasses, props.classes);

    return (
        <div className={classes.advancedSearchActions}>
            <button
                type='button'
                className={classes.action}
                onClick={() => {
                    setIsAutoCompleteOpen(false);
                    setIsOpen(true);
                }}
            >
                <FormattedMessage
                    id={'global.advancedSearch'}
                    defaultMessage={'Advanced Search'}
                />
                <span className={classes.badge}><FormattedMessage id={'advancedSearch.new'} defaultMessage={'New'}/></span>
            </button>
        </div>
    );
};

export default SearchMultiple;
