const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const submenuColumnComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/MegaMenu/submenuColumn.js'
    );

    const submenuColumnCustomClasses = submenuColumnComponent.addImport(
        "submenuColumnClasses from '@magenest/theme/BaseComponents/MegaMenu/extendStyle/submenuColumn.module.scss'"
    );

    submenuColumnComponent.insertAfterSource(
        'useStyle(defaultClasses, props.classes',
        `,${submenuColumnCustomClasses}`
    );
};
