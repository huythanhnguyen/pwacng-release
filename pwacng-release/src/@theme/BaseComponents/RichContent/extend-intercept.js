const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const richContentComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/RichContent/richContent.js'
    );

    const richContentCustomClasses = richContentComponent.addImport(
        "richContentClasses from '@magenest/theme/BaseComponents/RichContent/extendStyle/richContent.module.scss'"
    );

    richContentComponent.insertAfterSource(
        'useStyle(defaultClasses, props.classes',
        `,${richContentCustomClasses}`
    );
};
