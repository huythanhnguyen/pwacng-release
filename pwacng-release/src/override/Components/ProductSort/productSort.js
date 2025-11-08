import React, { useMemo, useCallback } from 'react';
import { ChevronDown as ArrowDown } from 'react-feather';
import { FormattedMessage, useIntl } from 'react-intl';
import { array, arrayOf, shape, string } from 'prop-types';
import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';

import { useStyle } from '@magento/venia-ui/lib/classify';
import SortItem from '@magento/venia-ui/lib/components/ProductSort/sortItem';
import defaultClasses from '@magenest/theme/BaseComponents/ProductSort/extendStyle/productSort.module.scss';
import Button from '@magento/venia-ui/lib/components/Button';
import Icon from '@magento/venia-ui/lib/components/Icon';

const ProductSort = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { availableSortMethods, sortProps } = props;
    const [currentSort, setSort] = sortProps;
    const { elementRef, expanded, setExpanded } = useDropdown();
    const { formatMessage, locale } = useIntl();

    const orderSortingList = useCallback(
        list => {
            return list.sort((a, b) => {
                return a.text.localeCompare(b.text, locale, {
                    sensitivity: 'base'
                });
            });
        },
        [locale]
    );

    const sortMethodsFromConfig = availableSortMethods
        ? availableSortMethods
              .map(method => {
                  const { value, label } = method;
                  if (value !== 'price' && value !== 'position' && value !== 'relevance' && value !== 'ecom_qty_ordered' && value !== 'mm_sale_price_include_vat') {
                      return {
                          id: `sortItem.${value}`,
                          text: label,
                          attribute: value,
                          sortDirection: 'ASC'
                      };
                  }
              })
              .filter(method => !!method)
        : null;

    // click event for menu items
    const handleItemClick = useCallback(
        sortAttribute => {
            setSort(prevSort => {
                return {
                    sortText: sortAttribute.text,
                    sortId: sortAttribute.id,
                    sortAttribute: sortAttribute.attribute,
                    sortDirection: sortAttribute.sortDirection,
                    sortFromSearch: prevSort.sortFromSearch
                };
            });
            setExpanded(false);
        },
        [setExpanded, setSort]
    );

    const sortElements = useMemo(() => {
        // should be not render item in collapsed mode.
        if (!expanded) {
            return null;
        }


        // Do not display Position in Search
        // if (!currentSort.sortFromSearch) {
        //     defaultSortMethods.push({
        //         id: 'sortItem.position',
        //         text: formatMessage({
        //             id: 'sortItem.relevance',
        //             defaultMessage: 'Best Match'
        //         }),
        //         attribute: 'position',
        //         sortDirection: 'ASC'
        //     });
        // }

        const defaultSortMethodsBefore = [
            {
                id: 'sortItem.relevance',
                text: formatMessage({
                    id: 'sortItem.relevance',
                    defaultMessage: 'Best Match'
                }),
                attribute: 'relevance',
                sortDirection: 'DESC'
            },
            {
                id: 'sortItem.ecom_qty_ordered',
                text: formatMessage({
                    id: 'sortItem.ecom_qty_ordered',
                    defaultMessage: 'Best seller'
                }),
                attribute: 'ecom_qty_ordered',
                sortDirection: 'DESC'
            }
        ];

        const defaultSortMethodsAfter = [
            {
                id: 'sortItem.priceAsc',
                text: formatMessage({
                    id: 'sortItem.priceAsc',
                    defaultMessage: 'Price low to high'
                }),
                attribute: 'mm_sale_price_include_vat',
                sortDirection: 'ASC'
            },
            {
                id: 'sortItem.priceDesc',
                text: formatMessage({
                    id: 'sortItem.priceDesc',
                    defaultMessage: 'Price high to low'
                }),
                attribute: 'mm_sale_price_include_vat',
                sortDirection: 'DESC'
            }
        ];

        const allSortingMethods = sortMethodsFromConfig
            ? [defaultSortMethodsBefore, sortMethodsFromConfig, defaultSortMethodsAfter].flat() : [defaultSortMethodsBefore, defaultSortMethodsAfter].flat();

        const itemElements = Array.from(allSortingMethods, sortItem => {
            const { attribute, sortDirection } = sortItem;
            const isActive =
                currentSort.sortAttribute === attribute &&
                currentSort.sortDirection === sortDirection;

            const key = `${attribute}--${sortDirection}`;
            return (
                <li key={key} className={classes.menuItem}>
                    <SortItem
                        sortItem={sortItem}
                        active={isActive}
                        onClick={handleItemClick}
                    />
                </li>
            );
        });

        return (
            <div className={classes.menu}>
                <ul>{itemElements}</ul>
            </div>
        );
    }, [
        classes.menu,
        classes.menuItem,
        currentSort.sortAttribute,
        currentSort.sortDirection,
        currentSort.sortFromSearch,
        expanded,
        formatMessage,
        handleItemClick,
        orderSortingList,
        sortMethodsFromConfig
    ]);

    // expand or collapse on click
    const handleSortClick = () => {
        setExpanded(!expanded);
    };

    const handleKeypress = e => {
        if (e.code == 'Enter') {
            setExpanded(expanded);
        }
    };
    const result = expanded
        ? formatMessage({
              id: 'productSort.sortButtonExpanded',
              defaultMessage: 'Sort Button Expanded'
          })
        : formatMessage({
              id: 'productSort.sortButtonCollapsed',
              defaultMessage: 'Sort Button Collapsed'
          });

    return (
        <div
            ref={elementRef}
            className={classes.root}
            data-cy="ProductSort-root"
            aria-busy="false"
        >
            <span className={classes.desktopText}>
                    <FormattedMessage
                        id={'productSort.sortBy'}
                        defaultMessage={'Sort by'}
                    />
            </span>
            <Button
                priority={'low'}
                classes={{
                    root_lowPriority: classes.sortButton
                }}
                onClick={handleSortClick}
                data-cy="ProductSort-sortButton"
                onKeyDown={handleKeypress}
                aria-label={result}
            >
                <span className={classes.sortText}>
                    <FormattedMessage
                        id={currentSort.sortId}
                        defaultMessage={currentSort.sortText}
                    />
                </span>
                <Icon
                    src={ArrowDown}
                    classes={{
                        root: classes.desktopIconWrapper,
                        icon: classes.desktopIcon
                    }}
                />
            </Button>
            {sortElements}
        </div>
    );
};

ProductSort.propTypes = {
    classes: shape({
        menuItem: string,
        menu: string,
        root: string,
        sortButton: string
    }),
    availableSortMethods: arrayOf(
        shape({
            label: string,
            value: string
        })
    ),
    sortProps: array
};

export default ProductSort;
