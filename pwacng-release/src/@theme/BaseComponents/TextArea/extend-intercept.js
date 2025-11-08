const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const textAreaComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/TextArea/textArea.js'
    );

    const textAreaCustomClasses = textAreaComponent.addImport(
        "textAreaClasses from '@magenest/theme/BaseComponents/TextArea/extendStyle/textArea.module.scss'"
    );

    textAreaComponent.insertAfterSource(
        'useStyle(defaultClasses, ',
        `${textAreaCustomClasses}, `
    );
};
