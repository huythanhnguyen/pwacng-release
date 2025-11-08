const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const stockStatusMessageComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/StockStatusMessage/stockStatusMessage.js'
    );

    const stockStatusMessageCustomClasses = stockStatusMessageComponent.addImport(
        "stockStatusMessageClasses from '@magenest/theme/BaseComponents/StockStatusMessage/extendStyle/stockStatusMessage.module.scss'"
    );

    stockStatusMessageComponent.insertAfterSource(
        'useStyle(defaultClasses, ',
        `${stockStatusMessageCustomClasses}, `
    );
};
