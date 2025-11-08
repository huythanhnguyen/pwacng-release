import React, {useState, useMemo} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './smartSearchFilter.module.scss';
import {shape, string} from "prop-types";
import {FormattedMessage, useIntl} from "react-intl";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import Price from "@magento/venia-ui/lib/components/Price";

const SmartSearchFilter = props => {
    const {
        categoryFilter,
        currentCategory,
        setCurrentCategory,
        brandFilter,
        currentBrand,
        setCurrentBrand,
        currentPrice,
        setCurrentPrice,
        handleFilterApply,
        handleManualFilterApplied,
        dialog = false
    } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const { isDesktop } = useMediaCheck();
    const [expanded, setExpanded] = useState({ category: true, brand: true, price: true });
    const toggle = key => setExpanded(s => ({ ...s, [key]: !s[key] }));
    const priceOptions = useMemo(
        () => [
            { min: 0, max: 100000 },
            { min: 100000, max: 500000 },
            { min: 500000, max: 1000000 },
            { min: 1000000, max: null }
        ],
        []
    );

    const isPriceActive = opt =>
        currentPrice &&
        currentPrice.min === opt.min &&
        currentPrice.max === opt.max;

    const priceLabel = p =>
        p.max == null ?
            <span>
                {formatMessage({ id: 'filterPrice.minLabel', defaultMessage: 'Over' })}{' '}
                <Price value={p.min} currencyCode={'VND'} />
            </span>
            : <span><Price value={p.min} currencyCode={'VND'} />{' - '}<Price value={p.max} currencyCode={'VND'} /></span>

    const valueToLabel = useMemo(() => {
        const map = new Map();
        (Array.isArray(categoryFilter) ? categoryFilter : []).forEach(opt => {
            if (opt && typeof opt.value === 'string') {
                map.set(opt.value, opt.label || '');
            }
        });
        return map;
    }, [categoryFilter]);

    const handleClick = item => {
        setCurrentCategory(prev => {
            const list = Array.isArray(prev) ? prev : Array.from(prev || []);
            const exists = list.some(x => x.value === item.value);
            const value = exists ? list.filter(x => x.value !== item.value) : [...list, item];
            if (!dialog) handleFilterApply(value, currentBrand, currentPrice);
            return value;
        });
        handleManualFilterApplied();
    };

    const handleBrandClick = item => {
        setCurrentBrand(prev => {
            const list = Array.isArray(prev) ? prev : Array.from(prev || []);
            const exists = list.some(x => x.value === item.value);
            const value = exists ? list.filter(x => x.value !== item.value) : [...list, item];
            if (!dialog) handleFilterApply(currentCategory, value, currentPrice);
            return value;
        });
        handleManualFilterApplied();
    };

    const handlePriceClick = (min, max) => {
        setCurrentPrice(() => {
            let value = null;
            if((min || max) && (!currentPrice || currentPrice.min !== min || currentPrice.max !== max)) {
                value = {min, max};
            }
            if (!dialog) handleFilterApply(currentCategory, currentBrand, value);
            return value;
        });
        handleManualFilterApplied();
    };

    const handleRemoveAll = () => {
        setCurrentCategory([]);
        setCurrentBrand([]);
        setCurrentPrice([]);
        if (!dialog) {
            handleFilterApply([]);
        }
        handleManualFilterApplied();
    };

    const selectedValues = useMemo(
        () => new Set((Array.isArray(currentCategory) ? currentCategory : []).map(x => x.value)),
        [currentCategory]
    );

    const selectedBrandValues = useMemo(
        () => new Set((Array.isArray(currentBrand) ? currentBrand : []).map(x => x.value)),
        [currentBrand]
    );

    return (
        <div className={classes.root}>
            {(isDesktop || currentCategory?.length > 0) && (
                <div className={classes.header}>
                    <h2 className={classes.headerTitle}>
                        <FormattedMessage
                            id={'filterModal.headerTitle'}
                            defaultMessage={'Filters'}
                        />
                    </h2>
                    {(currentCategory?.length > 0 || currentBrand?.length > 0 || currentPrice?.min || currentPrice?.max) && (
                        <div className={classes.currentFilter}>
                            <div className={classes.currentFilterList}>
                                {!!currentCategory?.length && currentCategory.map(item => (
                                    <p className={classes.currentItem} key={`currentFilter_${item.value}`}>
                                        <button
                                            onClick={() => handleClick(item)}
                                            className={classes.remove}
                                        ><span>{'Remove'}</span></button>
                                        <span>{item.label || valueToLabel.get(item.value) || String(item.value || '')}</span>
                                    </p>
                                ))}
                                {!!currentBrand?.length && currentBrand.map(item => (
                                    <p className={classes.currentItem} key={`currentFilter_${item.value}`}>
                                        <button
                                            onClick={() => handleBrandClick(item)}
                                            className={classes.remove}
                                        ><span>{'Remove'}</span></button>
                                        <span>{item.label || valueToLabel.get(item.value) || String(item.value || '')}</span>
                                    </p>
                                ))}
                                {(currentPrice?.min || currentPrice?.max) && (
                                    <p className={classes.currentItem} key={`currentFilter_price`}>
                                        <button
                                            onClick={() => handlePriceClick(null, null)}
                                            className={classes.remove}
                                        ><span>{'Remove'}</span></button>
                                        <span>{priceLabel(currentPrice)}</span>
                                    </p>
                                )}
                            </div>
                            <div className={classes.actions}>
                                <button className={classes.removeAll} onClick={handleRemoveAll}>
                                    <FormattedMessage
                                        id={'global.removeAll'}
                                        defaultMessage={'Remove all'}
                                    />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!!categoryFilter?.length && (
                <>
                    <button onClick={() => toggle('category')} className={expanded.category ? classes.titleExpanded : classes.title}>
                        <FormattedMessage
                            id={'global.category'}
                            defaultMessage={'Category'}
                        />
                    </button>
                    {expanded.category && (
                        <div className={classes.content}>
                            {categoryFilter.map(item => {
                                const active = selectedValues.has(item.value);
                                return (
                                    <button
                                        key={item.value}
                                        aria-pressed={active}
                                        onClick={() => handleClick(item)}
                                        className={active ? classes.itemActive : classes.item}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {!!brandFilter?.length && (
                <>
                    <button onClick={() => toggle('brand')} className={expanded.brand ? classes.titleExpanded : classes.title}>
                        <FormattedMessage
                            id={'global.brand'}
                            defaultMessage={'Brand'}
                        />
                    </button>
                    {expanded.brand && (
                        <div className={classes.content}>
                            {brandFilter.map(item => {
                                const active = selectedBrandValues.has(item.value);
                                return (
                                    <button
                                        key={item.value}
                                        aria-pressed={active}
                                        onClick={() => handleBrandClick(item)}
                                        className={active ? classes.itemActive : classes.item}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            <button onClick={() => toggle('price')} className={expanded.price ? classes.titleExpanded : classes.title}>
                <FormattedMessage
                    id={'global.price'}
                    defaultMessage={'Price'}
                />
            </button>
            {expanded.price && (
                <div className={classes.content}>
                    {priceOptions.map(opt => {
                        const active = isPriceActive(opt);
                        return (
                            <button
                                key={`${opt.min}-${opt.max || 'x'}`}
                                aria-pressed={!!active}
                                onClick={() => handlePriceClick(opt.min, opt.max)}
                                className={active ? classes.itemActive : classes.item}
                            >
                                {priceLabel(opt)}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default SmartSearchFilter;

SmartSearchFilter.propTypes = {
    classes: shape({
        root: string,
        headerTitle: string,
        item: string,
        itemActive: string,
        title: string,
        titleExpanded: string,
        content: string
    })
};
