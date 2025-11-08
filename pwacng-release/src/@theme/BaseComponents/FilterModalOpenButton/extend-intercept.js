const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const filterModalOpenButtonComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/FilterModalOpenButton/filterModalOpenButton.js'
    );

    const filterModalOpenButtonCustomClasses = filterModalOpenButtonComponent.addImport(
        "galleryClasses from '@magenest/theme/BaseComponents/FilterModalOpenButton/extendStyle/filterModalOpenButton.module.scss'"
    );

    filterModalOpenButtonComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${filterModalOpenButtonCustomClasses}, `
    );
};
