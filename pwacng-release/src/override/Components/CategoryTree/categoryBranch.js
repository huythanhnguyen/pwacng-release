import React from 'react';
import { func, number, shape, string } from 'prop-types';
import { useCategoryBranch } from '../../Talons/CategoryTree/useCategoryBranch';
import { ChevronRight } from 'react-feather';
import { Link } from 'react-router-dom';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/CategoryTree/categoryBranch.module.css';
import categoryBranchCustomClasses from "@magenest/theme/BaseComponents/CategoryTree/extendStyle/categoryBranch.module.scss";
import PlaceholderImage from "@magenest/theme/static/images/logommvn-placeholder.jpg";
import Icon from "@magento/venia-ui/lib/components/Icon";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";

const Branch = props => {
    const {
        category,
        setCategoryId,
        tabIndex,
        onNavigate,
        setView
    } = props;
    const { name, image, url_path, url_suffix } = category;
    const classes = useStyle(defaultClasses, categoryBranchCustomClasses, props.classes);

    const talonProps = useCategoryBranch({ category, setCategoryId, setView });
    const { exclude, handleClick } = talonProps;
    const destination = resourceUrl(`/${url_path}${url_suffix || ''}`);

    if (exclude) {
        return null;
    }

    return (
        <li className={classes.root}>
            <Link
                tabIndex={tabIndex}
                className={classes.target}
                data-cy="CategoryTree-Branch-target"
                type="button"
                to={destination}
                onClick={onNavigate}
            >
                {
                    image ? (
                        <img src={image} alt={name}/>
                    ) : (
                        <img src={PlaceholderImage} alt={category.name}/>
                    )
                }
                <span className={classes.text}>{name}</span>
            </Link>
            {
                Number(category?.children_count) > 0 && (
                    <Icon
                        classes={{ root: classes.icon }}
                        src={ChevronRight} size={22}
                        onClick={handleClick}
                    />
                )
            }
        </li>
    );
};

export default Branch;

Branch.propTypes = {
    category: shape({
        uid: string.isRequired,
        include_in_menu: number,
        name: string.isRequired
    }).isRequired,
    classes: shape({
        root: string,
        target: string,
        text: string
    }),
    setCategoryId: func.isRequired,
    tabIndex: string
};
