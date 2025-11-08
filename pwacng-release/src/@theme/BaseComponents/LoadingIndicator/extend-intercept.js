const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const loadingIndicatorComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/LoadingIndicator/indicator.js'
    );

    const loadingIndicatorCustomClasses = loadingIndicatorComponent.addImport(
        "loadingIndicatorClasses from '@magenest/theme/BaseComponents/LoadingIndicator/extendStyle/indicator.module.scss'"
    );

    loadingIndicatorComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${loadingIndicatorCustomClasses}, `
    );
};
