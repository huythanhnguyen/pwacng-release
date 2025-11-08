const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const PaginationComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/Pagination/pagination.js'
    );

    const PaginationCustomClasses = PaginationComponent.addImport(
        "paginationClasses from '@magenest/theme/BaseComponents/Pagination/extendStyle/pagination.module.scss'"
    );

    PaginationComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${PaginationCustomClasses}, `
    );

    const navButtonComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/Pagination/navButton.js'
    );

    const navButtonCustomClasses = navButtonComponent.addImport(
        "navButtonClasses from '@magenest/theme/BaseComponents/Pagination/extendStyle/navButton.module.scss'"
    );

    navButtonComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${navButtonCustomClasses}, `
    );

    const tileComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/Pagination/tile.js'
    );

    const tileCustomClasses = tileComponent.addImport(
        "tileClasses from '@magenest/theme/BaseComponents/Pagination/extendStyle/tile.module.scss'"
    );

    tileComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${tileCustomClasses}, `
    );
};
