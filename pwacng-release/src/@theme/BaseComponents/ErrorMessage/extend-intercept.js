const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const errorMessageComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/ErrorMessage/errorMessage.js'
    );

    const errorMessageCustomClasses = errorMessageComponent.addImport(
        "errorMessageClasses from '@magenest/theme/BaseComponents/ErrorMessage/extendStyle/errorMessage.module.scss'"
    );

    errorMessageComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${errorMessageCustomClasses}, `
    );
};
