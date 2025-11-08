const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    const toastComponent = targetables.reactComponent(
        '@magento/venia-ui/lib/components/ToastContainer/toast.js'
    );

    const toastCustomClasses = toastComponent.addImport(
        "textAreaClasses from '@magenest/theme/BaseComponents/ToastContainer/extendStyle/toast.module.scss'"
    );

    toastComponent.insertAfterSource(
        'useStyle(defaultClasses, ',
        `${toastCustomClasses}, `
    );
};
