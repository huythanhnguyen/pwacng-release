import React from 'react';
import { func, shape, string } from 'prop-types';
import { useCategoryTree } from '@magento/peregrine/lib/talons/CategoryTree';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Branch from './categoryBranch';
import Leaf from './categoryLeaf';
import defaultClasses from '@magento/venia-ui/lib/components/CategoryTree/categoryTree.module.css';
import categoryTreeCustomClasses from '@magenest/theme/BaseComponents/CategoryTree/extendStyle/categoryTree.module.scss'

const Tree = props => {
    const {
        categoryId,
        onNavigate,
        setCategoryId,
        updateCategories,
        tabIndex,
        onBack,
        setView
    } = props;

    const talonProps = useCategoryTree({
        categoryId,
        updateCategories
    });

    const { data, childCategories, categoryUrlSuffix } = talonProps;
    const classes = useStyle(defaultClasses, categoryTreeCustomClasses, props.classes);

    // for each child category, render a direct link if it has no children
    // otherwise render a branch
    const branchesLeaf = data
        ? Array.from(childCategories, childCategory => {
            const [id, { category, isLeaf }] = childCategory;

            return category?.children?.length > 0 && (
                <Leaf
                    key={id}
                    category={category}
                    onNavigate={onNavigate}
                    categoryUrlSuffix={categoryUrlSuffix}
                    tabIndex={tabIndex}
                    onBack={onBack}
                />
            );
        })
        : null;

    const branchesBranch = data
        ? Array.from(childCategories, childCategory => {
            const [id, { category, isLeaf }] = childCategory;

            return !category?.children?.length > 0 && (
                <Branch
                    key={id}
                    category={category}
                    setCategoryId={setCategoryId}
                    tabIndex={tabIndex}
                    onNavigate={onNavigate}
                    setView={setView}
                />
            );
        })
        : null;

    return (
        <div className={classes.root} data-cy="CategoryTree-root">
            <ul className={classes.tree}>
                {branchesLeaf}
                <ul className={classes.branches}>
                    {branchesBranch}
                </ul>
            </ul>
        </div>
    );
};

export default Tree;

Tree.propTypes = {
    categoryId: string,
    classes: shape({
        root: string,
        tree: string
    }),
    onNavigate: func.isRequired,
    setCategoryId: func.isRequired,
    updateCategories: func.isRequired,
    tabIndex: string
};
