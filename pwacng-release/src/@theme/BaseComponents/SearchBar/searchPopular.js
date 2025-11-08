import React from "react";
import { useQuery } from '@apollo/client';
import GET_POPULAR_KEYWORDS_QUERY from "./searchPopular.gql";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchPopular.module.scss';
import {FormattedMessage} from "react-intl";
import Button from "@magento/venia-ui/lib/components/Button";
import {Link} from "react-router-dom";

const SearchPopular = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { data, error, loading } = useQuery(GET_POPULAR_KEYWORDS_QUERY, {
        variables: {  }
    });
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    const popularKeys = data.getPopularKeywords?.items ? data.getPopularKeywords.items : [];

    return (
        <div className={classes.popularKeysWrapper}>
            <h3>
                <FormattedMessage
                    id={'searchBar.popular'}
                    defaultMessage={'Popular Search'}
                />
            </h3>
            <div className={classes.popularKeys}>
                {popularKeys.length > 0 ? (
                    popularKeys.map((item, index) => (
                        <div key={index} className={classes.popularKey}>
                            <Link to={item.url_pwa || '#'}>{item.name || ''}</Link>
                        </div>
                    ))
                ) : (
                    <p>
                        <FormattedMessage
                            id={'popularKeywords.noResult'}
                            defaultMessage={'No popular keywords found'}
                        />
                    </p>
                )}
            </div>
        </div>
    );
};

export default SearchPopular;
