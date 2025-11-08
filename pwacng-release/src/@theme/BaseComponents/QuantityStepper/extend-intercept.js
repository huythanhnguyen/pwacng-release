const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const quantityStepperComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/QuantityStepper/quantityStepper.js'
    );

    const quantityStepperCustomClasses = quantityStepperComponent.addImport(
        "quantityStepperClasses from '@magenest/theme/BaseComponents/QuantityStepper/extendStyle/quantityStepper.module.scss'"
    );

    quantityStepperComponent.insertAfterSource(
        'useStyle(defaultClasses, ',
        `${quantityStepperCustomClasses}, `
    );
};
