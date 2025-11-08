const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    const targetables = Targetables.using(targets);

    // Custom Classes - Column
    const columnComponent = targetables.reactComponent(
        '@magento/pagebuilder/lib/ContentTypes/Column/column.js'
    );

    const columnCustomClasses = columnComponent.addImport(
        "columnClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/column.module.scss'"
    );

    columnComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${columnCustomClasses},`
    );

    // Custom Classes - Slider Shimmer
    const sliderShimmerComponent = targetables.reactComponent(
        '@magento/pagebuilder/lib/ContentTypes/Slider/slider.shimmer.js'
    );

    const sliderShimmerCustomClasses = sliderShimmerComponent.addImport(
        "sliderShimmerClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/slider.shimmer.module.scss'"
    );

    sliderShimmerComponent.insertAfterSource(
        'useStyle(defaultClasses,',
        `${sliderShimmerCustomClasses},`
    );

    // Custom Classes - Buttons
    const buttonsComponent = targetables.reactComponent(
        '@magento/pagebuilder/lib/ContentTypes/Buttons/buttons.js'
    );

    const buttonsCustomClasses = "'pagebuilderButtons'";

    buttonsComponent.insertAfterSource(
        'className={[classes.root',
        `,${buttonsCustomClasses}`
    );

    // Custom Classes - Button Item
    const buttonItemComponent = targetables.reactComponent(
        '@magento/pagebuilder/lib/ContentTypes/ButtonItem/buttonItem.js'
    );

    const buttonItemCustomClasses = buttonItemComponent.addImport(
        "buttonItemClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/buttonItem.module.scss'"
    );

    buttonItemComponent.insertAfterSource(
        'useStyle(defaultClasses, props.classes',
        `,${buttonItemCustomClasses}`
    );

    // Custom Classes - Image Shimmer
    const imageShimmerComponent = targetables.reactComponent(
        '@magento/pagebuilder/lib/ContentTypes/Image/image.shimmer.js'
    );

    const imageShimmerCustomClasses = imageShimmerComponent.addImport(
        "imageShimmerClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/image.shimmer.module.scss'"
    );

    imageShimmerComponent.insertAfterSource(
        'useStyle(defaultClasses, props.classes',
        `,${imageShimmerCustomClasses}`
    );
};
