/**
 * Mappings for overwrites
 * example: [`@magento/venia-ui/lib/components/Main/main.js`]: './lib/components/Main/main.js'
 */
module.exports = componentOverride = {
    // App
    [`@magento/venia-ui/lib/components/Adapter/adapter.js`]: './src/override/Components/Adapter/adapter.js',
    [`@magento/peregrine/lib/talons/Adapter/useAdapter.js`]: './src/override/Talons/Adapter/useAdapter.js',
    [`@magento/venia-ui/lib/components/App/app.js`]: './src/override/Components/App/app.js',
    [`@magento/peregrine/lib/talons/App/useApp.js`]: './src/override/Talons/App/useApp.js',

    // Head
    [`@magento/venia-ui/lib/components/Head/index.js`]: './src/override/Components/Head/index.js',

    // Main
    [`@magento/venia-ui/lib/components/Main/main.js`]: './src/override/Components/Main/main.js',

    // Logo
    [`@magento/venia-ui/lib/components/Logo/VeniaLogo.svg`]: './src/override/Components/Logo/MMLogo.svg',
    [`@magento/venia-ui/lib/components/Logo/logo.js`]: './src/override/Components/Logo/logo.js',

    // Header
    [`@magento/venia-ui/lib/components/Header/header.js`]: './src/override/Components/Header/header.js',
    [`@magento/venia-ui/lib/components/Header/storeSwitcher.js`]: './src/override/Components/Header/storeSwitcher.js',
    [`@magento/venia-ui/lib/components/Header/cartTrigger.js`]: './src/override/Components/Header/cartTrigger.js',
    [`@magento/venia-ui/lib/components/MiniCart/miniCart.js`]: './src/override/Components/MiniCart/miniCart.js',
    [`@magento/venia-ui/lib/components/Header/navTrigger.js`]: './src/override/Components/Header/navTrigger.js',
    [`@magento/venia-ui/lib/components/Header/accountTrigger.js`]: './src/override/Components/Header/accountTrigger.js',
    [`@magento/peregrine/lib/talons/Header/useStoreSwitcher.js`]: './src/override/Talons/Header/useStoreSwitcher.js',
    [`@magento/peregrine/lib/talons/Header/storeSwitcher.gql.js`]: './src/override/Talons/Header/storeSwitcher.gql.js',
    [`@magento/peregrine/lib/talons/Header/useHeader.js`]: './src/override/Talons/Header/useHeader.js',
    [`@magento/peregrine/lib/talons/Header/useAccountTrigger.js`]: './src/override/Talons/Header/useAccountTrigger.js',
    [`@magento/peregrine/lib/talons/Header/useAccountMenu.js`]: './src/override/Talons/Header/useAccountMenu.js',
    [`@magento/peregrine/lib/talons/Header/useCartTrigger.js`]: './src/override/Talons/Header/useCartTrigger.js',

    // Search Bar
    [`@magento/venia-ui/lib/components/SearchBar/suggestedCategories.js`]: './src/override/Components/SearchBar/suggestedCategories.js',
    [`@magento/venia-ui/lib/components/SearchBar/suggestedCategory.js`]: './src/override/Components/SearchBar/suggestedCategory.js',
    [`@magento/venia-ui/lib/components/SearchBar/searchField.js`]: './src/override/Components/SearchBar/searchField.js',
    [`@magento/venia-ui/lib/components/SearchBar/searchBar.js`]: './src/override/Components/SearchBar/searchBar.js',
    [`@magento/venia-ui/lib/components/SearchBar/autocomplete.js`]: './src/override/Components/SearchBar/autocomplete.js',
    [`@magento/venia-ui/lib/components/SearchBar/suggestions.js`]: './src/override/Components/SearchBar/suggestions.js',
    [`@magento/venia-ui/lib/components/SearchBar/suggestedProduct.js`]: './src/override/Components/SearchBar/suggestedProduct.js',
    [`@magento/venia-ui/lib/components/SearchBar/suggestedProducts.js`]: './src/override/Components/SearchBar/suggestedProducts.js',
    [`@magento/peregrine/lib/talons/SearchBar/useAutocomplete.js`]: './src/override/Talons/SearchBar/useAutocomplete.js',
    [`@magento/peregrine/lib/talons/SearchBar/useSearchBar.js`]: './src/override/Talons/SearchBar/useSearchBar.js',
    [`@magento/peregrine/lib/talons/SearchBar/useSuggestions.js`]: './src/override/Talons/SearchBar/useSuggestions.js',
    [`@magento/peregrine/lib/talons/SearchBar/useSearchField.js`]: './src/override/Talons/SearchBar/useSearchField.js',
    [`@magento/peregrine/lib/talons/SearchBar/useSuggestedProduct.js`]: './src/override/Talons/SearchBar/useSuggestedProduct.js',
    [`@magento/peregrine/lib/talons/SearchPage/searchPage.gql.js`]: './src/override/Talons/SearchPage/searchPage.gql.js',

    // Account Chip
    [`@magento/venia-ui/lib/components/AccountChip/accountChip.js`]: './src/override/Components/AccountChip/accountChip.js',

    // Text/TextArea Input
    [`@magento/venia-ui/lib/components/TextInput/textInput.js`]: './src/override/Components/TextInput/textInput.js',
    [`@magento/venia-ui/lib/components/TextArea/textArea.js`]: './src/override/Components/TextArea/textArea.js',

    // Field
    [`@magento/venia-ui/lib/components/Field/fieldIcons.js`]: './src/override/Components/Field/fieldIcons.js',
    [`@magento/venia-ui/lib/components/Field/field.js`]: './src/override/Components/Field/field.js',
    [`@magento/venia-ui/lib/components/Field/message.js`]: './src/override/Components/Field/message.js',

    // Select
    [`@magento/venia-ui/lib/components/Select/select.js`]: './src/override/Components/Select/select.js',

    // PageBuilder
    [`@magento/pagebuilder/lib/config.js`]: './src/override/Pagebuilder/config.js',
    [`@magento/pagebuilder/lib/factory.js`]: './src/override/Pagebuilder/factory.js',

    // PageBuilder Row
    [`@magento/pagebuilder/lib/ContentTypes/Row/row.js`]: './src/override/ContentTypes/Row/row.js',

    // PageBuilder Column Group
    [`@magento/pagebuilder/lib/ContentTypes/ColumnGroup/columnGroup.js`]: './src/override/ContentTypes/ColumnGroup/columnGroup.js',

    // PageBuilder Column Line
    [`@magento/pagebuilder/lib/ContentTypes/ColumnLine/columnLine.js`]: './src/override/ContentTypes/ColumnLine/columnLine.js',

    // PageBuilder Slider
    [`@magento/pagebuilder/lib/ContentTypes/Slider/slider.js`]: './src/override/ContentTypes/Slider/slider.js',

    // PageBuilder Banner
    [`@magento/pagebuilder/lib/ContentTypes/Banner/banner.js`]: './src/override/ContentTypes/Banner/banner.js',
    [`@magento/pagebuilder/lib/ContentTypes/Banner/banner.shimmer.js`]: './src/override/ContentTypes/Banner/banner.shimmer.js',

    // PageBuilder Image
    [`@magento/pagebuilder/lib/ContentTypes/Image/image.js`]: './src/override/ContentTypes/Image/image.js',

    // PageBuilder Text
    [`@magento/pagebuilder/lib/ContentTypes/Text/text.js`]: './src/override/ContentTypes/Text/text.js',

    // PageBuilder Products
    [`@magento/pagebuilder/lib/ContentTypes/Products/index.js`]: './src/override/ContentTypes/Products/index.js',
    [`@magento/pagebuilder/lib/ContentTypes/Products/products.js`]: './src/override/ContentTypes/Products/products.js',

    // PageBuilder Html
    [`@magento/pagebuilder/lib/ContentTypes/Html/html.js`]: './src/override/ContentTypes/Html/html.js',

    // Navigation
    [`@magento/venia-ui/lib/components/Navigation/navigation.js`]: './src/override/Components/Navigation/navigation.js',
    [`@magento/peregrine/lib/talons/Navigation/useNavigation.js`]: './src/override/Talons/Navigation/useNavigation.js',
    [`@magento/peregrine/lib/talons/Navigation/navigation.gql.js`]: './src/override/Talons/Navigation/navigation.gql.js',

    // Footer
    [`@magento/venia-ui/lib/components/Footer/footer.js`]: './src/override/Components/Footer/footer.js',

    // errorView
    [`@magento/venia-ui/lib/components/MagentoRoute/magentoRoute.js`]: './src/override/Components/MagentoRoute/magentoRoute.js',
    [`@magento/peregrine/lib/talons/MagentoRoute/useMagentoRoute.js`]: './src/override/Talons/MagentoRoute/useMagentoRoute.js',
    [`@magento/venia-ui/lib/components/ErrorView/errorView.js`]: './src/override/Components/ErrorView/errorView.js',

    // CMS
    [`@magento/venia-ui/lib/RootComponents/CMS/cms.js`]: './src/override/Components/CMS/cms.js',
    [`@magento/venia-ui/lib/components/CmsBlock/cmsBlock.js`]: './src/override/Components/CmsBlock/cmsBlock.js',

    // Gallery
    [`@magento/venia-ui/lib/components/Gallery/gallery.js`]: './src/override/Components/Gallery/gallery.js',
    [`@magento/peregrine/lib/talons/Gallery/useGallery.js`]: './src/override/Talons/Gallery/useGallery.js',
    [`@magento/peregrine/lib/talons/Gallery/useGalleryItem.js`]: './src/override/Talons/Gallery/useGalleryItem.js',

    // Product Item
    [`@magento/venia-ui/lib/components/Gallery/item.js`]: './src/override/Components/Gallery/item.js',

    // Add to cart Button
    [`@magento/venia-ui/lib/components/Gallery/addToCartButton.js`]: './src/override/Components/Gallery/addToCartButton.js',

    // Pagination
    [`@magento/peregrine/lib/hooks/usePagination.js`]: './src/override/Hooks/usePagination.js',

    // MegaMenu
    [`@magento/venia-ui/lib/components/MegaMenu/megaMenu.js`]: './src/override/Components/MegaMenu/megaMenu.js',
    [`@magento/venia-ui/lib/components/MegaMenu/megaMenuItem.js`]: './src/override/Components/MegaMenu/megaMenuItem.js',
    [`@magento/venia-ui/lib/components/MegaMenu/submenu.js`]: './src/override/Components/MegaMenu/submenu.js',
    [`@magento/peregrine/lib/talons/MegaMenu/megaMenu.gql.js`]: './src/override/Talons/MegaMenu/megaMenu.gql.js',
    [`@magento/peregrine/lib/talons/MegaMenu/useMegaMenu.js`]: './src/override/Talons/MegaMenu/useMegaMenu.js',

    // Breadcrumbs
    [`@magento/venia-ui/lib/components/Breadcrumbs/breadcrumbs.js`]: './src/override/Components/Breadcrumbs/breadcrumbs.js',

    // Category Tree
    [`@magento/peregrine/lib/talons/RootComponents/Category/useCategoryContent.js`]: './src/override/Talons/RootComponents/Category/useCategoryContent.js',
    [`@magento/venia-ui/lib/components/CategoryTree/categoryBranch.js`]: './src/override/Components/CategoryTree/categoryBranch.js',
    [`@magento/venia-ui/lib/components/CategoryTree/categoryLeaf.js`]: './src/override/Components/CategoryTree/categoryLeaf.js',
    [`@magento/venia-ui/lib/components/CategoryTree/categoryTree.js`]: './src/override/Components/CategoryTree/categoryTree.js',
    [`@magento/peregrine/lib/talons/CategoryTree/categoryTree.gql.js`]: './src/override/Talons/CategoryTree/categoryTree.gql.js',
    [`@magento/peregrine/lib/talons/CategoryTree/useCategoryLeaf.js`]: './src/override/Talons/CategoryTree/useCategoryLeaf.js',

    // Auth Modal
    [`@magento/venia-ui/lib/components/AuthModal/authModal.js`]: './src/override/Components/AuthModal/authModal.js',

    // Sign In
    [`@magento/venia-ui/lib/components/SignIn/signIn.js`]: './src/override/Components/SignIn/signIn.js',
    [`@magento/peregrine/lib/talons/SignIn/useSignIn.js`]: './src/override/Talons/SignIn/useSignIn.js',
    [`@magento/peregrine/lib/talons/SignIn/signIn.gql.js`]: './src/override/Talons/SignIn/signIn.gql.js',
    [`@magento/peregrine/lib/store/actions/user/asyncActions.js`]: './src/override/Store/actions/user/asyncActions.js',

    // Password
    [`@magento/venia-ui/lib/components/Password/password.js`]: './src/override/Components/Password/password.js',

    // Link Button
    [`@magento/venia-ui/lib/components/LinkButton/linkButton.js`]: './src/override/Components/LinkButton/linkButton.js',

    // Button
    [`@magento/venia-ui/lib/components/Button/button.js`]: './src/override/Components/Button/button.js',

    // Account Menu
    [`@magento/venia-ui/lib/components/AccountMenu/accountMenu.js`]: './src/override/Components/AccountMenu/accountMenu.js',

    // Create Account
    [`@magento/venia-ui/lib/components/CreateAccount/createAccount.js`]: './src/override/Components/CreateAccount/createAccount.js',
    [`@magento/peregrine/lib/talons/CreateAccount/useCreateAccount.js`]: './src/override/Talons/CreateAccount/useCreateAccount.js',
    [`@magento/peregrine/lib/talons/CreateAccount/createAccount.gql.js`]: './src/override/Talons/CreateAccount/createAccount.gql.js',

    // Sign In Page
    [`@magento/venia-ui/lib/components/SignInPage/signInPage.js`]: './src/override/Components/SignInPage/signInPage.js',
    [`@magento/peregrine/lib/talons/SignInPage/useSignInPage.js`]: './src/override/Talons/SignInPage/useSignInPage.js',

    // Create Account Page
    [`@magento/venia-ui/lib/components/CreateAccountPage/createAccountPage.js`]: './src/override/Components/CreateAccountPage/createAccountPage.js',

    // Forgot Password Page
    [`@magento/venia-ui/lib/components/ForgotPassword/forgotPassword.js`]: './src/override/Components/ForgotPassword/forgotPassword.js',
    [`@magento/venia-ui/lib/components/ForgotPassword/FormSubmissionSuccessful/formSubmissionSuccessful.js`]: './src/override/Components/ForgotPassword/FormSubmissionSuccessful/formSubmissionSuccessful.js',
    [`@magento/venia-ui/lib/components/ForgotPassword/ForgotPasswordForm/forgotPasswordForm.js`]: './src/override/Components/ForgotPassword/ForgotPasswordForm/forgotPasswordForm.js',
    [`@magento/venia-ui/lib/components/ForgotPasswordPage/forgotPasswordPage.js`]: './src/override/Components/ForgotPasswordPage/forgotPasswordPage.js',

    // Checkbox
    [`@magento/venia-ui/lib/components/Checkbox/checkbox.js`]: './src/override/Components/Checkbox/checkbox.js',

    // Form Validators
    [`@magento/venia-ui/lib/util/formValidators.js`]: './src/override/Util/formValidators.js',
    [`@magento/peregrine/lib/util/images.js`]: './src/override/Util/images.js',

    // Category Page
    [`@magento/venia-ui/lib/RootComponents/Category/categoryContent.js`]: './src/override/Components/Category/categoryContent.js',
    [`@magento/venia-ui/lib/RootComponents/Category/NoProductsFound/noProductsFound.js`]: './src/override/Components/Category/NoProductsFound/noProductsFound.js',
    [`@magento/peregrine/lib/talons/RootComponents/Category/categoryFragments.gql.js`]: './src/override/Components/Category/categoryFragments.gql.js',

    // Search Page
    [`@magento/venia-ui/lib/components/SearchPage/searchPage.js`]: './src/override/Components/SearchPage/searchPage.js',

    // Product
    [`@magento/peregrine/lib/hooks/useSort.js`]: './src/override/Hooks/useSort.js',
    [`@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail.js`]: './src/override/Components/ProductFullDetail/useProductFullDetail.js',
    [`@magento/peregrine/lib/talons/RootComponents/Product/productDetailFragment.gql.js`]: './src/override/Components/Product/productDetailFragment.gql.js',
    [`@magento/venia-ui/lib/components/ProductSort/productSort.js`]: './src/override/Components/ProductSort/productSort.js',
    [`@magento/venia-ui/lib/components/ProductFullDetail/productFullDetail.js`]: './src/override/Components/ProductFullDetail/productFullDetail.js',
    [`@magento/venia-ui/lib/components/ProductImageCarousel/carousel.js`]: './src/override/Components/ProductImageCarousel/carousel.js',
    [`@magento/venia-ui/lib/components/ProductImageCarousel/thumbnail.js`]: './src/override/Components/ProductImageCarousel/thumbnail.js',

    // Filter
    [`@magento/venia-ui/lib/components/FilterSidebar/filterSidebar.js`]: './src/override/Components/FilterSidebar/filterSidebar.js',
    [`@magento/venia-ui/lib/components/FilterModal/filterModal.js`]: './src/override/Components/FilterModal/filterModal.js',
    [`@magento/venia-ui/lib/components/FilterModal/CurrentFilters/currentFilters.js`]: './src/override/Components/FilterModal/CurrentFilters/currentFilters.js',
    [`@magento/peregrine/lib/talons/FilterSidebar/useFilterSidebar.js`]: './src/override/Talons/FilterSidebar/useFilterSidebar.js',

    // MiniCart
    [`@magento/venia-ui/lib/components/LegacyMiniCart/cartOptions.gql.js`]: './src/override/Components/LegacyMiniCart/cartOptions.gql.js',
    [`@magento/venia-ui/lib/components/MiniCart/miniCart.gql.js`]: './src/override/Components/MiniCart/miniCart.gql.js',
    [`@magento/peregrine/lib/talons/MiniCart/useMiniCart.js`]: './src/override/Talons/MiniCart/useMiniCart.js',
    [`@magento/peregrine/lib/talons/MiniCart/miniCartFragments.gql.js`]: './src/override/Talons/MiniCart/miniCartFragments.gql.js',
    [`@magento/venia-ui/lib/components/MiniCart/ProductList/productList.js`]: './src/override/Components/MiniCart/ProductList/productList.js',
    [`@magento/venia-ui/lib/components/MiniCart/ProductList/item.js`]: './src/override/Components/MiniCart/ProductList/item.js',
    [`@magento/peregrine/lib/talons/MiniCart/ProductList/productListFragments.gql.js`]: './src/override/Talons/MiniCart/ProductList/productListFragments.gql.js',

    // Cart Page
    [`@magento/venia-ui/lib/components/CartPage/cartPage.js`]: './src/override/Components/CartPage/cartPage.js',
    [`@magento/venia-ui/lib/components/CartPage/ProductListing/product.js`]: './src/override/Components/CartPage/ProductListing/product.js',
    [`@magento/venia-ui/lib/components/CartPage/ProductListing/productListing.js`]: './src/override/Components/CartPage/ProductListing/productListing.js',
    [`@magento/venia-ui/lib/components/CartPage/PriceSummary/priceSummary.js`]: './src/override/Components/CartPage/PriceSummary/priceSummary.js',
    [`@magento/venia-ui/lib/components/CartPage/PriceSummary/discountSummary.js`]: './src/override/Components/CartPage/PriceSummary/discountSummary.js',
    [`@magento/venia-ui/lib/components/CartPage/PriceSummary/shippingSummary.js`]: './src/override/Components/CartPage/PriceSummary/shippingSummary.js',
    [`@magento/peregrine/lib/talons/CartPage/ProductListing/productListingFragments.gql.js`]: './src/override/Talons/CartPage/ProductListing/productListingFragments.gql.js',
    [`@magento/peregrine/lib/talons/CartPage/ProductListing/product.gql.js`]: './src/override/Talons/CartPage/ProductListing/product.gql.js',
    [`@magento/peregrine/lib/talons/CartPage/ProductListing/useProduct.js`]: './src/override/Talons/CartPage/ProductListing/useProduct.js',
    [`@magento/peregrine/lib/talons/CartPage/cartPage.gql.js`]: './src/override/Talons/CartPage/cartPage.gql.js',
    [`@magento/peregrine/lib/talons/CartPage/useCartPage.js`]: './src/override/Talons/CartPage/useCartPage.js',
    [`@magento/peregrine/lib/talons/CartPage/PriceSummary/priceSummaryFragments.gql.js`]: './src/override/Talons/CartPage/PriceSummary/priceSummaryFragments.gql.js',
    [`@magento/peregrine/lib/talons/CartPage/PriceSummary/shippingSummary.gql.js`]: './src/override/Talons/CartPage/PriceSummary/shippingSummary.gql.js',
    [`@magento/peregrine/lib/talons/CartPage/PriceSummary/usePriceSummary.js`]: './src/override/Talons/CartPage/PriceSummary/usePriceSummary.js',

    // Form Error
    [`@magento/peregrine/lib/talons/FormError/useFormError.js`]: './src/override/Talons/FormError/useFormError.js',

    // My Account
    [`@magento/venia-ui/lib/components/MyAccount/ResetPassword/resetPassword.js`]: './src/override/Components/MyAccount/ResetPassword/resetPassword.js',
    [`@magento/peregrine/lib/talons/MyAccount/useResetPassword.js`]: './src/override/Talons/MyAccount/useResetPassword',
    [`@magento/venia-ui/lib/components/AccountInformationPage/accountInformationPage.js`]: './src/override/Components/AccountInformationPage/accountInformationPage.js',
    [`@magento/venia-ui/lib/components/AccountInformationPage/accountInformationPageFragment.gql.js`]: './src/override/Components/AccountInformationPage/accountInformationPageFragment.gql.js',
    [`@magento/peregrine/lib/talons/OrderHistoryPage/useOrderHistoryPage.js`]: './src/override/Talons/OrderHistoryPage/useOrderHistoryPage.js',
    [`@magento/peregrine/lib/talons/OrderHistoryPage/orderHistoryPage.gql.js`]: './src/override/Talons/OrderHistoryPage/orderHistoryPage.gql.js',
    [`@magento/venia-ui/lib/components/OrderHistoryPage/orderHistoryPage.js`]: './src/override/Components/OrderHistoryPage/orderHistoryPage.js',
    [`@magento/venia-ui/lib/components/OrderHistoryPage/orderRow.js`]: './src/override/Components/OrderHistoryPage/orderRow.js',
    [`@magento/venia-ui/lib/components/OrderHistoryPage/orderProgressBar.js`]: './src/override/Components/OrderHistoryPage/orderProgressBar.js',
    [`@magento/venia-ui/lib/components/AddressBookPage/addressBookPage.js`]: './src/override/Components/AddressBookPage/addressBookPage.js',
    [`@magento/venia-ui/lib/components/AddressBookPage/addEditDialog.js`]: './src/override/Components/AddressBookPage/addEditDialog.js',

    // Checkout Page
    [`@magento/venia-ui/lib/components/CheckoutPage/checkoutPage.js`]: './src/override/Components/CheckoutPage/checkoutPage.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/GuestSignIn/guestSignIn.js`]: './src/override/Components/CheckoutPage/GuestSignIn/guestSignIn.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/OrderSummary/orderSummary.js`]: './src/override/Components/CheckoutPage/OrderSummary/orderSummary.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/AddressForm/guestForm.js`]: './src/override/Components/CheckoutPage/ShippingInformation/AddressForm/guestForm.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/AddressForm/customerForm.js`]: './src/override/Components/CheckoutPage/ShippingInformation/AddressForm/customerForm.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/editModal.js`]: './src/override/Components/CheckoutPage/ShippingInformation/editModal.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/paymentMethods.js`]: './src/override/Components/CheckoutPage/PaymentInformation/paymentMethods.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/paymentInformation.js`]: './src/override/Components/CheckoutPage/PaymentInformation/paymentInformation.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/card.js`]: './src/override/Components/CheckoutPage/ShippingInformation/card.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/shippingMethod.js`]: './src/override/Components/CheckoutPage/ShippingMethod/shippingMethod.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/AddressBook/addressBook.js`]: './src/override/Components/CheckoutPage/AddressBook/addressBook.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/AddressBook/addressCard.js`]: './src/override/Components/CheckoutPage/AddressBook/addressCard.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage.js`]: './src/override/Talons/CheckoutPage/useCheckoutPage.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/checkoutPage.gql.js`]: './src/override/Talons/CheckoutPage/checkoutPage.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ShippingMethod/useShippingMethod.js`]: './src/override/Talons/CheckoutPage/ShippingMethod/useShippingMethod.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ShippingMethod/shippingMethod.gql.js`]: './src/override/Talons/CheckoutPage/ShippingMethod/shippingMethod.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/AddressBook/useAddressBook.js`]: './src/override/Talons/CheckoutPage/AddressBook/useAddressBook.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/AddressBook/addressBookFragments.gql.js`]: './src/override/Talons/CheckoutPage/AddressBook/addressBookFragments.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ItemsReview/itemsReviewFragments.gql.js`]: './src/override/Talons/CheckoutPage/ItemsReview/itemsReviewFragments.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/AddressForm/useGuestForm.js`]: './src/override/Talons/CheckoutPage/ShippingInformation/AddressForm/useGuestForm.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/useShippingInformation.js`]: './src/override/Talons/CheckoutPage/ShippingInformation/useShippingInformation.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/shippingInformationFragments.gql.js`]: './src/override/Talons/CheckoutPage/ShippingInformation/shippingInformationFragments.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/usePaymentInformation.js`]: './src/override/Talons/CheckoutPage/PaymentInformation/usePaymentInformation.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/paymentInformation.gql.js`]: './src/override/Talons/CheckoutPage/PaymentInformation/paymentInformation.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/usePaymentMethods.js`]: './src/override/Talons/CheckoutPage/PaymentInformation/usePaymentMethods.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/paymentMethods.gql.js`]: './src/override/Talons/CheckoutPage/PaymentInformation/paymentMethods.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/AddressForm/useCustomerForm.js`]: './src/override/Talons/CheckoutPage/ShippingInformation/AddressForm/useCustomerForm.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/AddressForm/customerForm.gql.js`]: './src/override/Talons/CheckoutPage/ShippingInformation/AddressForm/customerForm.gql.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/AddressBook/useAddressCard.js`]: './src/override/Talons/CheckoutPage/AddressBook/useAddressCard.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/useOrderConfirmationPage.js`]: './src/override/Talons/CheckoutPage/OrderConfirmationPage/useOrderConfirmationPage.js',
    [`@magento/peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/orderConfirmationPageFragments.gql.js`]: './src/override/Talons/CheckoutPage/OrderConfirmationPage/orderConfirmationPageFragments.gql.js',

    // Ratio Group
    [`@magento/venia-ui/lib/components/RadioGroup/radio.js`]: './src/override/Components/RadioGroup/radio.js',

    [`@magento/peregrine/lib/talons/RootComponents/Product/useProduct.js`]: './src/override/RootComponents/Product/useProduct.js',
    [`@magento/venia-ui/lib/RootComponents/Product/product.js`]: './src/override/RootComponents/Product/product.js',

    // Wishlist Page
    [`@magento/peregrine/lib/talons/WishlistPage/useWishlistPage.js`]: './src/override/Talons/WishlistPage/useWishlistPage.js',
    [`@magento/peregrine/lib/talons/WishlistPage/useWishlist.js`]: './src/override/Talons/WishlistPage/useWishlist.js',
    [`@magento/peregrine/lib/talons/WishlistPage/useCreateWishlist.js`]: './src/override/Talons/WishlistPage/useCreateWishlist.js',
    [`@magento/peregrine/lib/talons/WishlistPage/wishlistPage.gql.js`]: './src/override/Talons/WishlistPage/wishlistPage.gql.js',
    [`@magento/peregrine/lib/talons/WishlistPage/createWishlist.gql.js`]: './src/override/Talons/WishlistPage/createWishlist.gql.js',
    [`@magento/peregrine/lib/talons/WishlistPage/wishlistItemFragments.gql.js`]: './src/override/Talons/WishlistPage/wishlistItemFragments.gql.js',
    [`@magento/peregrine/lib/talons/WishlistPage/wishlistItem.gql.js`]: './src/override/Talons/WishlistPage/wishlistItem.gql.js',
    [`@magento/peregrine/lib/talons/WishlistPage/wishlist.gql.js`]: './src/override/Talons/WishlistPage/wishlist.gql.js',
    [`@magento/peregrine/lib/talons/WishlistPage/useWishlistItems.js`]: './src/override/Talons/WishlistPage/useWishlistItems.js',
    [`@magento/venia-ui/lib/components/WishlistPage/wishlistPage.js`]: './src/override/Components/WishlistPage/wishlistPage.js',
    [`@magento/venia-ui/lib/components/WishlistPage/createWishlist.ee.js`]: './src/override/Components/WishlistPage/createWishlist.ee.js',
    [`@magento/venia-ui/lib/components/WishlistPage/wishlist.js`]: './src/override/Components/WishlistPage/wishlist.js',
    [`@magento/venia-ui/lib/components/WishlistPage/wishlistItems.js`]: './src/override/Components/WishlistPage/wishlistItems.js',
    [`@magento/venia-ui/lib/components/WishlistPage/wishlistItem.js`]: './src/override/Components/WishlistPage/wishlistItem.js',

    // Wishlist
    [`@magento/pagebuilder/lib/ContentTypes/Products/Carousel/carousel.gql.ee.js`]: './src/override/ContentTypes/Products/Carousel/carousel.gql.ee.js',
    [`@magento/pagebuilder/lib/ContentTypes/Products/Carousel/useCarousel.js`]: './src/override/ContentTypes/Products/Carousel/useCarousel.js',
    [`@magento/peregrine/lib/talons/Wishlist/AddToListButton/useAddToListButton.ee.js`]: './src/override/Talons/Wishlist/AddToListButton/useAddToListButton.ee.js',
    [`@magento/peregrine/lib/talons/Wishlist/WishlistDialog/useWishlistDialog.js`]: './src/override/Talons/Wishlist/WishlistDialog/useWishlistDialog.js',
    [`@magento/peregrine/lib/talons/Wishlist/WishlistDialog/wishlistDialog.gql.js`]: './src/override/Talons/Wishlist/WishlistDialog/wishlistDialog.gql.js',
    [`@magento/venia-ui/lib/components/Wishlist/AddToListButton/addToListButton.ee.js`]: './src/override/Components/Wishlist/AddToListButton/addToListButton.ee.js',
    [`@magento/venia-ui/lib/components/Wishlist/WishlistDialog/wishlistDialog.js`]: './src/override/Components/Wishlist/WishlistDialog/wishlistDialog.js',
    [`@magento/peregrine/lib/talons/Wishlist/AddToListButton/helpers/useSingleWishlist.js`]: './src/override/Talons/Wishlist/AddToListButton/helpers/useSingleWishlist.js',

    // Price
    [`@magento/venia-ui/lib/components/Price/price.js`]: './src/override/Components/Price/price.js',

    // Dialog
    [`@magento/venia-ui/lib/components/Dialog/dialog.js`]: './src/override/Components/Dialog/dialog.js',

    // Contact Page
    [`@magento/venia-ui/lib/components/ContactPage/contactPage.js`]: './src/@theme/BaseComponents/Contact/contact.js',

    // Shimmer
    [`@magento/venia-ui/lib/RootComponents/Shimmer/shimmer.js`]: './src/override/RootComponents/Shimmer/shimmer.js',

    // Image
    [`@magento/venia-ui/lib/components/Image/resourceImage.js`]: './src/override/Components/Image/resourceImage.js',

    // Category
    [`@magento/peregrine/lib/talons/RootComponents/Category/useCategory.js`]: './src/override/Talons/RootComponents/Category/useCategory.js',

    [`@magento/peregrine/lib/hooks/useCustomerWishlistSkus/useCustomerWishlistSkus.js`]: './src/override/Hooks/useCustomerWishlistSkus/useCustomerWishlistSkus.js',
};
