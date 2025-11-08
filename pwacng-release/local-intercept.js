/* eslint-disable */
/**
 * Custom interceptors for the project.
 *
 * This project has a section in its package.json:
 *    "pwa-studio": {
 *        "targets": {
 *            "intercept": "./local-intercept.js"
 *        }
 *    }
 *
 * This instructs Buildpack to invoke this file during the intercept phase,
 * as the very last intercept to run.
 *
 * A project can intercept targets from any of its dependencies. In a project
 * with many customizations, this function would tap those targets and add
 * or modify functionality from its dependencies.
 */

const moduleOverrideWebpackPlugin = require('./src/override/moduleOverrideWebpackPlugin');
const componentOverrideMapping = require('./src/override/componentOverrideMapping');

const amRichContentIntercept = require('@magenest/theme/BaseComponents/RichContent/extend-intercept');
const amContentTypesIntercept = require('@magenest/theme/BaseComponents/ContentTypes/extend-intercept');
const amMegaMenuIntercept = require('@magenest/theme/BaseComponents/MegaMenu/extend-intercept');
const amCategoryIntercept = require('@magenest/theme/BaseComponents/Category/extend-intercept');
const amFilterModalIntercept = require('@magenest/theme/BaseComponents/FilterModal/extend-intercept');
const amFilterModalOpenButtonIntercept = require('@magenest/theme/BaseComponents/FilterModalOpenButton/extend-intercept');
const amPaginationIntercept = require('@magenest/theme/BaseComponents/Pagination/extend-intercept');
const amLoadingIndicatorIntercept = require('@magenest/theme/BaseComponents/LoadingIndicator/extend-intercept');
const amQuantityStepperIntercept = require('@magenest/theme/BaseComponents/QuantityStepper/extend-intercept');
const amTextAreaIntercept = require('@magenest/theme/BaseComponents/TextArea/extend-intercept');
const amStockStatusMessageIntercept = require('@magenest/theme/BaseComponents/StockStatusMessage/extend-intercept');
const amErrorMessageIntercept = require('@magenest/theme/BaseComponents/ErrorMessage/extend-intercept');
const amToastIntercept = require('@magenest/theme/BaseComponents/ToastContainer/extend-intercept');
const amMaskIntercept = require('@magenest/theme/BaseComponents/Mask/extend-intercept');

function localIntercept(targets) {
    targets.of('@magento/pwa-buildpack').transformUpward.tap((definitions) => {
        if (definitions.veniaSecurityHeaders && definitions.veniaSecurityHeaders.inline) {
            // content-security-policy
            definitions.veniaSecurityHeaders.inline['content-security-policy'].template.when = [
                {
                    matches: 'env.NODE_ENV',
                    pattern: 'development',
                    use: {
                        inline: ''
                    }
                },
                {
                    matches: 'env.SCRIPT_NAME',
                    pattern: '.*\\.php$',
                    use: {
                        inline:
                            " script-src http: https: 'unsafe-inline' {{ backend }} *.goong.io *.mmpro.vn *.googletagmanager.com td.doubleclick.net cdn.jsdelivr.net st-a.cdp.asia 'unsafe-eval'; " +
                            "style-src 'self' blob: https: 'unsafe-inline' {{ backend }} *.goong.io *.mmpro.vn cdn.jsdelivr.net; " +
                            "img-src 'self' data: http: https: *.mmpro.vn *.goong.io; " +
                            "object-src 'none'; " +
                            "base-uri 'none'; " +
                            "child-src 'self' blob: *.goong.io *.mmpro.vn cdn.jsdelivr.net; " +
                            "font-src 'self' *.antsomi.com *.mmpro.vn fonts.gstatic.com; " +
                            "worker-src 'self' blob: *.goong.io *.mmpro.vn cdn.jsdelivr.net; " +
                            "frame-src assets.braintreegateway.com *.google.com *.mmpro.vn *.youtube.com *.youtu.be *.vimeo.com *.goong.io *.googletagmanager.com td.doubleclick.net *.freshchat.com cdn.jsdelivr.net "
                    }
                }
            ];
            definitions.veniaSecurityHeaders.inline['content-security-policy'].template.default.inline =
                " script-src http: https: 'unsafe-inline' {{ backend }} *.goong.io *.mmpro.vn *.googletagmanager.com td.doubleclick.net cdn.jsdelivr.net st-a.cdp.asia 'unsafe-eval'; " +
                "style-src 'self' blob: https: 'unsafe-inline' {{ backend }} *.goong.io *.mmpro.vn cdn.jsdelivr.net; " +
                "img-src 'self' data: http: https: *.mmpro.vn *.goong.io; " +
                "object-src 'none'; " +
                "base-uri 'none'; " +
                "child-src 'self' blob: *.goong.io *.mmpro.vn cdn.jsdelivr.net; " +
                "font-src 'self' *.antsomi.com *.mmpro.vn fonts.gstatic.com; " +
                "worker-src 'self' blob: *.goong.io *.mmpro.vn cdn.jsdelivr.net; " +
                "frame-src assets.braintreegateway.com *.google.com *.mmpro.vn *.youtube.com *.youtu.be *.vimeo.com *.goong.io *.googletagmanager.com td.doubleclick.net *.freshchat.com cdn.jsdelivr.net ";
        }

        if (definitions.veniaResponse && definitions.veniaResponse.when) {
            const fileExtensionMatch = definitions.veniaResponse.when.find(match => match.matches === 'fileExtension');

            if (fileExtensionMatch) {
                fileExtensionMatch.pattern = '(js|json|png|jpg|gif|svg|ico|css|txt|ttf|otf)';
            } else {
                definitions.veniaResponse.when.push({
                    matches: 'fileExtension',
                    pattern: '(js|json|png|jpg|gif|svg|ico|css|txt|ttf|otf)',
                    use: 'veniaStatic'
                });
            }

            const requestUrlMatch = definitions.veniaResponse.when.find(match => match.matches === 'request.url.pathname');

            if (requestUrlMatch) {
                requestUrlMatch.pattern = '^/(graphql|rest|media|momo/payment/ipn|vnpay/order/ipn|zalopay/payment/ipn|rest/v2/orders/create|rest/v1/orders/update|robots.txt)(/|$)';
            } else {
                definitions.veniaResponse.when.push({
                    matches: 'request.url.pathname',
                    pattern: '^/(graphql|rest|media|momo|vnpay|zalopay|robots.txt)(/|$)',
                    use: 'veniaProxy'
                });
            }
        }
    });

    targets.of('@magento/pwa-buildpack').webpackCompiler.tap(compiler => {
        new moduleOverrideWebpackPlugin(componentOverrideMapping).apply(
            compiler
        );
    });

    // Change static path
    targets.of('@magento/pwa-buildpack').transformUpward.tap(def => {
        def.staticFromRoot.inline.body.file.template.inline =
            './static/{{ filename }}';
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Account Menu",
            pattern: "/account",
            path: require.resolve("./src/override/Components/MyAccount/Dashboard/account.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Dashboard",
            pattern: "/dashboard",
            path: require.resolve("./src/override/Components/MyAccount/Dashboard/dashboard.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "FAQ",
            pattern: "/faq",
            path: require.resolve("@magenest/theme/BaseComponents/FaqPage/faqPage.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Update Phone Number",
            pattern: "/update-phone-number",
            path: require.resolve("@magenest/theme/BaseComponents/UpdatePhoneNumber/updatePhoneNumber.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Update Customer Email",
            pattern: "/mcard/update-customer-email",
            path: require.resolve("@magenest/theme/BaseComponents/UpdateCustomerEmail/updateCustomerEmail.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Order Detail",
            pattern: "/order/:orderId",
            path: require.resolve("./src/override/Components/OrderHistoryPage/orderDetailPage.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Tracking Order",
            pattern: "/order-tracking",
            path: require.resolve("./src/override/Components/OrderHistoryPage/orderGuest.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Store Locator",
            pattern: "/store-locator",
            path: require.resolve("@magenest/theme/BaseComponents/StoreLocator/storeLocator.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Contact",
            pattern: "/contact",
            path: require.resolve("@magenest/theme/BaseComponents/Contact/contact.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Order Confirmation Page",
            pattern: "/order-confirmation",
            path: require.resolve("./src/override/Components/CheckoutPage/OrderConfirmationPage/orderConfirmationPage.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Quick Order Page",
            pattern: "/quick-order",
            path: require.resolve("@magenest/theme/BaseComponents/QuickOrder/quickOrder.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Blog Page",
            pattern: "/blog",
            path: require.resolve("@magenest/theme/BaseComponents/Blog/index.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Blog Search Page",
            pattern: "/blog-search",
            path: require.resolve("@magenest/theme/BaseComponents/Blog/BlogSearchPage/blogSearchPage.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Blog Detail",
            pattern: "/blog/:blogId",
            path: require.resolve("@magenest/theme/BaseComponents/Blog/BlogDetailPage/blogDetailPage.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Promotional Flyer",
            pattern: "/flyer",
            path: require.resolve("@magenest/theme/BaseComponents/ListPdf/pdfCategory.js")
        });
    });

    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "Search AI",
            pattern: "/search-ai",
            path: require.resolve("@magenest/theme/BaseComponents/SearchAI/searchAI.js")
        });
    });

    /**
     * Intercept for RichContent
     */
    amRichContentIntercept(targets);

    /**
     * Intercept for ContentTypes
     */
    amContentTypesIntercept(targets);

    /**
     * Intercept for MegaMenu
     */
    amMegaMenuIntercept(targets);

    /**
     * Intercept for Category
     */
    amCategoryIntercept(targets);

    /**
     * Intercept for FilterModal
     */
    amFilterModalIntercept(targets);

    /**
     * Intercept for FilterModal
     */
    amFilterModalOpenButtonIntercept(targets);

    /**
     * Intercept for FilterModal
     */
    amPaginationIntercept(targets);

    /**
     * Intercept for FilterModal
     */
    amLoadingIndicatorIntercept(targets);

    /**
     * Intercept for FilterModal
     */
    amQuantityStepperIntercept(targets);

    /**
     * Intercept for TextArea
     */
    amTextAreaIntercept(targets);

    /**
     * Intercept for StockStatusMessage
     */
    amStockStatusMessageIntercept(targets);

    /**
     * Intercept for StockStatusMessage
     */
    amErrorMessageIntercept(targets);

    /**
     * Intercept for amToastIntercept
     */
    amToastIntercept(targets);

    /**
     * Intercept for amMaskIntercept
     */
    amMaskIntercept(targets);
}

module.exports = localIntercept;
