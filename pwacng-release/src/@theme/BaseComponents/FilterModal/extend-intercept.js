const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const filterBlockComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/FilterModal/filterBlock.js'
    );

    const filterBlockCustomClasses = filterBlockComponent.addImport(
        "filterBlockClasses from '@magenest/theme/BaseComponents/FilterModal/extendStyle/filterBlock.module.scss'"
    );

    filterBlockComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${filterBlockCustomClasses}, `
    );

    const filterListComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/FilterModal/FilterList/filterList.js'
    );

    const filterListCustomClasses = filterListComponent.addImport(
        "filterListClasses from '@magenest/theme/BaseComponents/FilterModal/extendStyle/filterList.module.scss'"
    );

    filterListComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${filterListCustomClasses}, `
    );

    const currentFiltersComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/FilterModal/CurrentFilters/currentFilters.js'
    );

    const currentFiltersCustomClasses = currentFiltersComponent.addImport(
        "currentFiltersClasses from '@magenest/theme/BaseComponents/FilterModal/extendStyle/currentFilters.module.scss'"
    );

    currentFiltersComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${currentFiltersCustomClasses}, `
    );

    const currentFilterComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/FilterModal/CurrentFilters/currentFilter.js'
    );

    const currentFilterCustomClasses = currentFilterComponent.addImport(
        "currentFilterClasses from '@magenest/theme/BaseComponents/FilterModal/extendStyle/currentFilter.module.scss'"
    );

    currentFilterComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${currentFilterCustomClasses}, `
    );

    const filterFooterComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/FilterModal/filterFooter.js'
    );

    const filterFooterCustomClasses = filterFooterComponent.addImport(
        "currentFilterClasses from '@magenest/theme/BaseComponents/FilterModal/extendStyle/filterFooter.module.scss'"
    );

    filterFooterComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${filterFooterCustomClasses}, `
    );
};
