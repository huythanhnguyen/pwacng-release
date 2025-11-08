import React, {useMemo, Fragment, Suspense, useState, useEffect, useRef, useCallback} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import CryptoJS from 'crypto-js';
import { Form } from 'informed';
import { Info } from 'react-feather';
import Cookies from 'js-cookie';

import Price from '@magento/venia-ui/lib/components/Price';
import { useProductFullDetail } from '@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Breadcrumbs from '@magento/venia-ui/lib/components/Breadcrumbs';
import Button from '@magento/venia-ui/lib/components/Button';
import Carousel from '@magento/venia-ui/lib/components/ProductImageCarousel';
import FormError from '@magento/venia-ui/lib/components/FormError';
import QuantityStepper from '@magento/venia-ui/lib/components/QuantityStepper';
import RichContent from '@magento/venia-ui/lib/components/RichContent/richContent';
import { ProductOptionsShimmer } from '@magento/venia-ui/lib/components/ProductOptions';
import CustomAttributes from '@magento/venia-ui/lib/components/ProductFullDetail/CustomAttributes';
import defaultClasses from '@magenest/theme/BaseComponents/ProductFullDetail/extendStyle/productFullDetail.module.scss';
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import AddToCartButton from "../Gallery/addToCartPDP";
import {useToasts} from "@magento/peregrine";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import ProductLabel from "../ProductLabel/productLabel";
import SimilarProduct from "./similarProducts";
import DnrProducts from "./dnrProducts";
import {Link, useHistory} from "react-router-dom";
import DNR_PRODUCTS from "../Product/dnrProducts.gql";
import {useQuery} from "@apollo/client";
import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";
import DnrBlock from "@magenest/theme/BaseComponents/Dnr/dnrBlock";
import ReactGA from "react-ga4";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useUserContext} from "@magento/peregrine/lib/context/user";
// import StoreSwitcher from "@magenest/theme/BaseComponents/ProductFullDetail/storeSwitcher";
import StoreSwitcherTrigger from "@magenest/theme/BaseComponents/ProductFullDetail/storeSwitcherTrigger";
import {Meta, Title} from "../Head";
import ProductSchema from "@magenest/theme/BaseComponents/Schema/productSchema";
import RelatedUpsellProducts from "./relatedUpsellProducts";
import {GET_STORE_CONFIG_DATA} from "@magento/peregrine/lib/talons/Gallery/gallery.gql";

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const WishlistButton = React.lazy(() => import('@magento/venia-ui/lib/components/Wishlist/AddToListButton/addToListButton.ee'));
const Options = React.lazy(() => import('@magento/venia-ui/lib/components/ProductOptions'));
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));
const ConfirmRedirectDialog = React.lazy(() => import('@magenest/theme/BaseComponents/SignIn/confirmRedirectDialog'));
// Correlate a GQL error message to a field. GQL could return a longer error
// string but it may contain contextual info such as product id. We can use
// parts of the string to check for which field to apply the error.
const ERROR_MESSAGE_TO_FIELD_MAPPING = {
    'The requested qty is not available': 'quantity',
    'Product that you are trying to add is not available.': 'quantity',
    "The product that was requested doesn't exist.": 'quantity'
};

// Field level error messages for rendering.
const ERROR_FIELD_TO_MESSAGE_MAPPING = {
    quantity: 'The requested quantity is not available.'
};

const DescriptionTabs = React.lazy(() => import('./descriptionTabs'));
const ProductFullDetail = props => {
    const {
        product,
        productFrame,
        handleChatbotOpened,
        handleSaveToStorage,
        setSignInRedirect
    } = props;

    const talonProps = useProductFullDetail({ product });

    const {
        breadcrumbCategoryId,
        mainCategoryName,
        errorMessage,
        handleAddToCart,
        handleSelectionChange,
        isOutOfStock,
        isEverythingOutOfStock,
        outOfStockVariants,
        isAddToCartDisabled,
        isSupportedProductType,
        mediaGalleryEntries,
        productDetails,
        customAttributes,
        wishlistButtonProps
    } = talonProps;

    const history = useHistory();
    const { isMobile } = useMediaCheck();
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const [{ isSignedIn, currentUser }] = useUserContext();

    const storage = new BrowserPersistence();

    const shouldShowContactLink = false;

    const [dealProducts, setDealProducts] = useState([]);
    const [giftProducts, setGiftProducts] = useState([]);

    const [ageConfirmOpen, setAgeConfirmOpen] = useState(!Cookies.get('ageConfirmed'));
    const [ viewProduct, setViewProduct ] = useState(true);
    const store = storage.getItem('store');
    const storeName = store?.storeInformation?.name || '';
    const storeCode = store?.storeInformation?.source_code?.replace('b2c_', '') || '';


    const handleCopy = () => {
        const currentURL = `${window.location.origin}/${product.canonical_url}`; // Lấy URL hiện tại
        navigator.clipboard.writeText(currentURL).then(() => {
            ReactGA.event('share', {
                category: 'Engagement',
                label: 'Copy',
                value: 1,
                method: 'Copy',
                content_type: 'Product',
                content_name: product?.ecom_name || product.name,
                store_id: storeCode,
                store_name: storeName,
                item_id: `${product.art_no}_${storeCode}`
            });

            addToast({
                type: 'success',
                message: formatMessage({
                    id: 'global.copyText',
                    defaultMessage: 'Copy the product successfully'
                }),
                timeout: 5000
            });
        }).catch(error => {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        });
    }

    const classes = useStyle(defaultClasses, props.classes);

    const options = isProductConfigurable(product) ? (
        <Suspense fallback={<ProductOptionsShimmer />}>
            <Options
                onSelectionChange={handleSelectionChange}
                options={product.configurable_options}
                isEverythingOutOfStock={isEverythingOutOfStock}
                outOfStockVariants={outOfStockVariants}
            />
        </Suspense>
    ) : null;

    const breadcrumbs = (breadcrumbCategoryId && !productFrame) ? (
        <Breadcrumbs
            categoryId={breadcrumbCategoryId}
            currentProduct={productDetails.name}
        />
    ) : null;

    // Fill a map with field/section -> error.
    const errors = new Map();
    if (errorMessage) {
        Object.keys(ERROR_MESSAGE_TO_FIELD_MAPPING).forEach(key => {
            if (errorMessage.includes(key)) {
                const target = ERROR_MESSAGE_TO_FIELD_MAPPING[key];
                const message = ERROR_FIELD_TO_MESSAGE_MAPPING[target];
                errors.set(target, message);
            }
        });

        // Handle cases where a user token is invalid or expired. Preferably
        // this would be handled elsewhere with an error code and not a string.
        if (errorMessage.includes('The current user cannot')) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorToken',
                        defaultMessage:
                            'There was a problem with your cart. Please sign in again and try adding the item once more.'
                    })
                )
            ]);
        }

        // Handle cases where a cart wasn't created properly.
        if (
            errorMessage.includes('Variable "$cartId" got invalid value null')
        ) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorCart',
                        defaultMessage:
                            'There was a problem with your cart. Please refresh the page and try adding the item once more.'
                    })
                )
            ]);
        }

        // An unknown error should still present a readable message.
        if (!errors.size) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorUnknown',
                        defaultMessage:
                            'Could not add item to cart. Please check required options and try again.'
                    })
                )
            ]);
        }
    }

    const customAttributesDetails = useMemo(() => {
        const list = [];
        const pagebuilder = [];
        const skuAttribute = {
            attribute_metadata: {
                uid: 'attribute_sku',
                used_in_components: ['PRODUCT_DETAILS_PAGE'],
                ui_input: {
                    ui_input_type: 'TEXT'
                },
                label: formatMessage({
                    id: 'global.sku',
                    defaultMessage: 'SKU'
                })
            },
            entered_attribute_value: {
                value: productDetails.sku
            }
        };
        if (Array.isArray(customAttributes)) {
            customAttributes.forEach(customAttribute => {
                if (
                    customAttribute.attribute_metadata.ui_input
                        .ui_input_type === 'PAGEBUILDER'
                ) {
                    pagebuilder.push(customAttribute);
                } else {
                    list.push(customAttribute);
                }
            });
        }
        list.unshift(skuAttribute);
        return {
            list: list,
            pagebuilder: pagebuilder
        };
    }, [customAttributes, productDetails.sku, formatMessage]);

    const cartCallToActionText =
        !isEverythingOutOfStock || !isOutOfStock ? (
            <FormattedMessage
                id="productFullDetail.addItemToCart"
                defaultMessage="Add to Cart"
            />
        ) : (
            <FormattedMessage
                id="productFullDetail.itemOutOfStock"
                defaultMessage="Out of Stock"
            />
        );
    // Error message for screen reader
    const cartActionContent = isSupportedProductType ? (
        <section className={classes.actButton}>
            <Button
                data-cy="ProductFullDetail-addToCartButton"
                disabled={isAddToCartDisabled}
                aria-disabled={isAddToCartDisabled}
                aria-label={
                    isEverythingOutOfStock
                        ? formatMessage({
                              id: 'productFullDetail.outOfStockProduct',
                              defaultMessage:
                                  'This item is currently out of stock'
                          })
                        : ''
                }
                priority="high"
                type="submit"
            >
                {cartCallToActionText}
            </Button>
        </section>
    ) : (
        <div className={classes.unavailableContainer}>
            <Info />
            <p>
                <FormattedMessage
                    id={'productFullDetail.unavailableProduct'}
                    defaultMessage={
                        'This product is currently unavailable for purchase.'
                    }
                />
            </p>
        </div>
    );

    const shortDescription = productDetails.shortDescription ? (
        <RichContent html={productDetails.shortDescription.html} />
    ) : null;

    const pageBuilderAttributes = customAttributesDetails.pagebuilder.length ? (
        <section className={classes.detailsPageBuilder}>
            <CustomAttributes
                classes={{ list: classes.detailsPageBuilderList }}
                customAttributes={customAttributesDetails.pagebuilder}
                showLabels={false}
            />
        </section>
    ) : null;

    const { data: storeConfigData } = useQuery(GET_STORE_CONFIG_DATA, {
        fetchPolicy: 'cache-and-network'
    });

    const storeConfig = storeConfigData ? storeConfigData.storeConfig : null;
    const productUrlSuffix = storeConfig && storeConfig.product_url_suffix;

    const { data: dnrProductsData } = useQuery(DNR_PRODUCTS, {
        fetchPolicy: 'cache-and-network',
        variables: {
            sku: productDetails.sku
        }
    });

    const oldPrice = product.price.regularPrice.amount;
    const isDiscount = product.price_range.maximum_price.discount?.percent_off ? Math.round(product.price_range.maximum_price.discount.percent_off) : 0;
    const amountOff = product.price_range.maximum_price.discount?.amount_off || 0;
    const similarProducts = product.similar_products || [];
    const greatDealProducts = dnrProductsData?.products?.items?.[0]?.dnr_promotion?.great_deal || [];
    const freeGiftProducts = dnrProductsData?.products?.items?.[0]?.dnr_promotion?.free_gift || [];
    const samePromotionProducts = dnrProductsData?.products?.items?.[0]?.dnr_promotion?.same_promotion || [];

    useEffect(() => {
        try {
            if (viewProduct) {
                setViewProduct(false);
                ReactGA.event('view_item',{
                    category: "Ecommerce",
                    label: 'Product Detail Page',
                    value: product.price_range?.maximum_price?.final_price?.value || 0,
                    store_id: storeCode,
                    store_name: storeName,
                    items: [
                        {
                            item_id: `${product.art_no}_${storeCode}`,
                            item_name: product?.ecom_name || product.name,
                            item_brand: null,
                            item_category: mainCategoryName || product.categories?.[0]?.name || "Unknown",
                            price: product.price_range?.maximum_price?.final_price?.value || 0
                        }
                    ]
                });

                const productItemsTrack = {
                    "type": "product", // Fixed Value
                    "id": `${product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                    "name": product?.ecom_name || product.name,
                    "sku": product.sku, // ArtNo + "_" + Barcode
                    "page_url": window.location.href,
                    "image_url": product.small_image.url || "",
                    "store_id": storeCode,
                    "store_name": storeName,
                    "price": product.price_range?.maximum_price?.final_price?.value || 0,
                    "original_price": isDiscount && isDiscount > 0 ? product.price.regularPrice.amount.value : product.price_range.maximum_price.final_price.value,
                    "main_category": product.categories?.[0]?.name || "Unknown",
                    "brand": product.mm_brand && product.mm_brand !== '0' ? product.mm_brand : "NO BRAND"
                };
                if (product.categories?.[1]) {
                    productItemsTrack.category_level_1 = product.categories[1].name;
                }
                if (product.categories?.[2]) {
                    productItemsTrack.category_level_2 = product.categories[2].name;
                }

                if (isSignedIn && currentUser) {
                    const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || '';
                    window.web_event.track("product", "view", {
                        items: [productItemsTrack],
                        dims: {
                            customers: {
                                "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                "name": currentUser.firstname,
                                "email": currentUser.email,
                                "phone": customerPhoneNumber
                            }
                        }
                    })
                } else {
                    window.web_event.track("product", "view", {
                        items: [productItemsTrack]
                    })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [product, viewProduct]);

    const metaTitle = `${productDetails.name}${formatMessage({
        id: 'category.metaTitle',
        defaultMessage: ' good price, home delivery | MM Mega Market',
    })}`;

    const metaDescription = `${formatMessage({
        id: 'category.metaBuyNow',
        defaultMessage: 'Buy now',
    })} ${productDetails.name} ${formatMessage({
        id: 'category.metaDescription',
        defaultMessage: 'for your family at MM Mega Market fresh, safe, carefully packaged, fast delivery nationwide. Easy ordering.',
    })}`;

    const handleAlcoholConfirm = () => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        setAgeConfirmOpen(false);
    };

    useEffect(() => {
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (product.is_alcohol && !ageConfirmOpen && !ageConfirmedCookies) {
            addToast({
                type: 'success',
                message: (
                    <div className={classes.redirectMessage}>
                        {formatMessage({
                           id: 'global.redirectTo',
                           defaultMessage: 'You will be redirected to '
                        })}
                        <Link to="/">
                            <FormattedMessage
                                id={'global.home'}
                                defaultMessage={'the Home page'}
                            />
                        </Link>
                    </div>
                ),
                dismissable: true,
                timeout: 5000
            });
            const timeout = setTimeout(() => {
                history.push('/');
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [product, ageConfirmOpen]);

    return (
        <Fragment>
            <Title>{metaTitle}</Title>
            <Meta  name="title" content={metaTitle} />
            <Meta name="description" content={metaDescription} />
            <Meta property="og:title" content={metaTitle} />
            <Meta property="og:description" content={metaDescription} />
            <Meta property="og:image" content={product.small_image.url} />
            <Meta property="og:url" content={`${window.location.origin}/${product.canonical_url}`} />
            <Meta property="og:type" content={'product'} />
            <ProductSchema
                breadcrumbCategoryId={breadcrumbCategoryId}
                productDetails={productDetails}
                product={product}
                brandName={product.mm_brand && product.mm_brand !== '0' ? product.mm_brand : 'NO BRAND'}
                isOutOfStock={isOutOfStock}
            />
            <div className={classes.breadcrumbsWrap}>
                {breadcrumbs}
            </div>
            <div className={classes.productDetail}>
                <section className={classes.imageCarousel}>
                    <Carousel images={mediaGalleryEntries} isAlcohol={product.is_alcohol} />
                    <div className={classes.productLabelWrapper}>
                        <ProductLabel labelData={product.product_label} currentPage={'product_image'} percent={isDiscount} amount={amountOff} currencyCode={productDetails.price.currency}/>
                    </div>
                    {(productFrame && !isSignedIn) ? (
                        <div className={classes.wishlistButton + ' wishlistButtonPDP'}>
                            <button className={classes.wishlistTrigger} onClick={() => setSignInRedirect(true)}>
                                <FormattedMessage
                                    id="wishlistButton.addText"
                                    defaultMessage="Add to Favorites"
                                />
                            </button>
                        </div>
                    ) : (
                        <Suspense fallback={null}>
                            <div className={classes.wishlistButton + ' wishlistButtonPDP'}>
                                <WishlistButton {...wishlistButtonProps} />
                            </div>
                        </Suspense>
                    )}
                </section>
                <section className={classes.mainDetails}>
                    <h1
                        aria-live="polite"
                        className={classes.productName}
                        data-cy="ProductFullDetail-productName"
                    >
                        {productDetails.name}
                        <span className={classes.extendHeading}>
                            {' '}<FormattedMessage id="global.extendHeading" defaultMessage="good price, home delivery" />
                        </span>
                    </h1>
                    <div className={classes.ratingSkuWrapper}>
                        <div className={classes.ratingSummaryWrapper}>
                            <p className={classes.ratingSummary}>
                                <span className={classes.ratingSummaryInner} style={{width: product.rating_summary + '%'}}></span>
                            </p>
                            <span>
                                {product.review_count + ' '}
                                {product.review_count > 1 ?
                                    <FormattedMessage
                                        id={'global.reviews'}
                                        defaultMessage={'reviews'}
                                    /> :
                                    <FormattedMessage
                                        id={'global.review'}
                                        defaultMessage={'review'}
                                    />
                                }
                            </span>
                        </div>
                        <span className={classes.lineDivider}></span>
                        {(productFrame && product.mm_brand && product.mm_brand !== '0') ? (
                            <>
                                <p
                                    data-cy="ProductFullDetail-productSku"
                                    className={classes.productBrand}
                                >
                                    <span className={classes.value}>
                                        {product.mm_brand}
                                    </span>
                                </p>
                                <span className={classes.lineDivider}></span>
                            </>
                        ) : null}
                        <p
                            data-cy="ProductFullDetail-productSku"
                            className={classes.productSku}
                        >
                            <strong>
                                <FormattedMessage
                                    id={'productFullDetail.sku'}
                                    defaultMessage={'Sku'}
                                />
                                {' '}
                            </strong>
                            <span className={classes.value}>
                                {productDetails.sku}
                            </span>
                        </p>
                        <span className={classes.lineDivider}></span>
                        <div className={classes.productShare}>
                            <button onClick={handleCopy} className={classes.socialShareBtn}>
                                <FormattedMessage
                                    id={'global.share'}
                                    defaultMessage={'Share'}
                                />
                            </button>
                        </div>
                    </div>
                    {/*<StoreSwitcher />*/}
                    <StoreSwitcherTrigger onClick={handleSaveToStorage} />
                    { productDetails.price.value !== 1 ? (
                        <div className={classes.priceWrapper}>
                            <div className={classes.finalPrice}>
                                <Price
                                    currencyCode={productDetails.price.currency}
                                    value={productDetails.price.value}
                                />
                                {product.unit_ecom ? ' / ' + product.unit_ecom : ''}
                            </div>
                            {(isDiscount && isDiscount > 0) ? (
                                <>
                                    <div className={classes.oldPrice}>
                                        <Price
                                            currencyCode={oldPrice.currency}
                                            value={oldPrice.value}
                                        />
                                    </div>
                                    <div className={classes.discount}>
                                        {'-' + isDiscount + '%'}
                                    </div>
                                </>
                            ) : (<></>)}
                        </div>
                    ) : ''}

                    { product.dnr_price && (
                        <DnrLabel classes={classes} dnrData={product.dnr_price} />
                    )}
                    <div className={classes.shortDescription}>
                        {shortDescription}
                    </div>
                    <Form
                        className={classes.addToCartForm}
                        data-cy="ProductFullDetail-root"
                        onSubmit={isProductConfigurable(product) && handleAddToCart}
                    >
                        <FormError
                            classes={{
                                root: classes.formErrors
                            }}
                            errors={errors.get('form') || []}
                        />
                        {
                            options && (
                                <div className={classes.options}>{options}</div>
                            )
                        }
                        { greatDealProducts.length > 0 && (
                            <DnrProducts
                                isSignedIn={isSignedIn}
                                currentUser={currentUser}
                                storeCode={storeCode}
                                storeName={storeName}
                                currentProductUid={product.uid}
                                products={greatDealProducts}
                                currencyCode={productDetails.price.currency}
                                title={formatMessage({
                                    id: 'productFullDetail.dealProducts',
                                    defaultMessage: 'Great deal'
                                })}
                                type={'deal'}
                                dealProducts={dealProducts}
                                setDealProducts={setDealProducts}
                            />
                        )}
                        { freeGiftProducts.length > 0 && (
                            <DnrProducts
                                isSignedIn={isSignedIn}
                                currentUser={currentUser}
                                storeCode={storeCode}
                                storeName={storeName}
                                currentProductUid={product.uid}
                                products={freeGiftProducts}
                                currencyCode={productDetails.price.currency}
                                title={formatMessage({
                                    id: 'productFullDetail.freeGiftProducts',
                                    defaultMessage: 'Free gift'
                                })}
                                type={'gift'}
                                giftProducts={giftProducts}
                                setGiftProducts={setGiftProducts}
                            />
                        )}
                        <div className={classes.actions}>
                            {
                                isProductConfigurable(product) ? (
                                    <>
                                        <div className={classes.quantity}>
                                            <QuantityStepper
                                                min={1}
                                                message={errors.get('quantity')}
                                            />
                                        </div>
                                        {cartActionContent}
                                    </>
                                ) : (
                                    <>
                                        {
                                            productDetails.price.value === 1 ? (
                                                <a className={classes.contact} href={'tel:1800088879'}>
                                                    <FormattedMessage
                                                        id={'global.contact'}
                                                        defaultMessage={'Contact'}
                                                    />
                                                </a>
                                            ) : (
                                                <AddToCartButton classes={classes} item={product} urlSuffix={product.url_suffix} dealProducts={dealProducts} giftProducts={giftProducts}/>
                                            )
                                        }
                                    </>
                                )
                            }
                        </div>
                        {!!productFrame && (
                            <div className={classes.productDetailsLink}>
                                <Link className={classes.productLink} to={`/${product.canonical_url}`} onClick={() => handleChatbotOpened(false)}>
                                    <FormattedMessage
                                        id={'aiChatBox.goToDetail'}
                                        defaultMessage={'Go to product page'}
                                    />
                                </Link>
                            </div>
                        )}
                        <div className={classes.addToCartNote}>
                            <div className={classes.addToCartNoteInner}>
                                <b>{'MMVN '}</b>
                                <FormattedMessage
                                    id={'productFullDetail.addToCartNote'}
                                    defaultMessage={'will contact before delivery, should there be any changes'}
                                />
                            </div>
                        </div>
                    </Form>

                    {
                        product.dnr_price && (
                            <DnrBlock classes={classes} dnrData={product.dnr_price} currencyCode={productDetails.price.currency}/>
                        )
                    }

                    <div className={classes.moreDetails}>
                        <span data-cy="ProductFullDetail-detailsTitle" className={classes.detailsTitle}>
                            <FormattedMessage
                                id={'productFullDetail.details'}
                                defaultMessage={'Details'}
                            />
                        </span>
                        <CustomAttributes customAttributes={customAttributesDetails.list}/>
                    </div>
                    {samePromotionProducts.length > 0 && (
                        <DnrProducts
                            isSignedIn={isSignedIn}
                            currentUser={currentUser}
                            storeCode={storeCode}
                            storeName={storeName}
                            currentProductUid={product.uid}
                            products={samePromotionProducts}
                            currencyCode={productDetails.price.currency}
                            title={formatMessage({
                                id: 'productFullDetail.samePromotionProducts',
                                defaultMessage: 'Products with the same promotion'
                            })}
                            type={'promotion'}
                        />
                    )}
                    {similarProducts.length > 0 && (
                        <SimilarProduct
                            product={product}
                            productUrlSuffix={productUrlSuffix}
                        />
                    )}
                    {
                        shouldShowContactLink && (
                            <div className={classes.contactLink}>
                                <Link className={classes.link} to="/contact-us">
                                    <FormattedMessage
                                        id={'productFullDetail.wholesale'}
                                        defaultMessage={'Wholesale buyer? Contact us for better price'}
                                    />
                                </Link>
                            </div>
                        )
                    }
                    {!productFrame && (
                        <CmsBlock
                            identifiers={'footer_delivery'}
                            classes={{root: classes.deliveryWrapper}}
                        />
                    )}
                </section>
                <div className={classes.descriptionWrapper}>
                    {!productFrame && (
                        <RelatedUpsellProducts classes={classes} productDetails={productDetails} />
                    )}
                    {!productFrame && (
                        <Suspense fallback={null}>
                            <DescriptionTabs
                                classes={classes}
                                isMobile={isMobile}
                                product={product}
                                productDetails={productDetails}
                            />
                        </Suspense>
                    )}
                    {pageBuilderAttributes}
                </div>
            </div>
            {!!productFrame && (
                <Suspense fallback={null}>
                    <DescriptionTabs
                        classes={classes}
                        isMobile={isMobile}
                        product={product}
                        productDetails={productDetails}
                    />
                </Suspense>
            )}
            {product.is_alcohol && ageConfirmOpen && (
                <Suspense fallback={null}>
                    <AlcoholDialog
                        isOpen={ageConfirmOpen}
                        setIsOpen={setAgeConfirmOpen}
                        onConfirm={handleAlcoholConfirm}
                        isBusy={false}
                    />
                </Suspense>
            )}
        </Fragment>
    );
};

ProductFullDetail.propTypes = {
    classes: shape({
        cartActions: string,
        description: string,
        descriptionTitle: string,
        details: string,
        detailsPageBuilder: string,
        detailsPageBuilderList: string,
        detailsTitle: string,
        imageCarousel: string,
        options: string,
        productName: string,
        productPrice: string,
        quantity: string,
        quantityTitle: string,
        quantityRoot: string,
        root: string,
        title: string,
        unavailableContainer: string
    }),
    product: shape({
        __typename: string,
        id: number,
        stock_status: string,
        sku: string.isRequired,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    currency: string.isRequired,
                    value: number.isRequired
                })
            }).isRequired
        }).isRequired,
        media_gallery_entries: arrayOf(
            shape({
                uid: string,
                label: string,
                position: number,
                disabled: bool,
                file: string.isRequired
            })
        ),
        description: shape({
            html: string
        }),
        short_description: shape({
            html: string,
            __typename: string
        })
    }).isRequired
};

export default ProductFullDetail;
