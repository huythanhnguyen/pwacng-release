const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const categoryComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/RootComponents/Category/category.js'
    );

    const categoryCustomClasses = categoryComponent.addImport(
        "categoryClasses from '@magenest/theme/BaseComponents/Category/extendStyle/category.module.scss'"
    );

    categoryComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${categoryCustomClasses}, `
    );
};
