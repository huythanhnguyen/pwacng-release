const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const maskComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/Mask/mask.js'
    );

    const maskCustomClasses = maskComponent.addImport(
        "maskClasses from '@magenest/theme/BaseComponents/Mask/extendStyle/mask.module.scss'"
    );

    maskComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${maskCustomClasses}, `
    );
};
