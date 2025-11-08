import React, {useRef, memo, useCallback} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import Price from "../../../override/Components/Price/price";
import ProductBySkus from "./productBySkus";
import ProductMessageExtend from "./productMessageExtend";
import ProductGroupKeywords from "./productGroupKeywords";
import ProductGalleryBySkus from "./productGalleryBySkus";
import {Link, useHistory} from "react-router-dom";
import useProducts from "./useProducts";
import useDraggableScroll from 'use-draggable-scroll';
import {useMutation} from "@apollo/client";
import {REORDER} from "../../../override/Components/OrderHistoryPage/reorder.gql";
import {REORDER_GUEST_MUTATION} from "../../Talons/OrderConfirmationPage/orderConfirmationPage.gql";
import {useToasts} from "@magento/peregrine";
import {AlertCircle as AlertCircleIcon} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const formatDate = (dateString) => {
    if (!dateString) return '';
    // Convert date to ISO-8601 format so Safari can also parse it
    const isoFormattedDate = dateString.replace(' ', 'T');
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(isoFormattedDate));
};
const BotMessage = memo(
    ({
         html,
         closingHtml,
         cta,
         skus,
         cart,
         order,
         classes,
         renderContent,
         handleSelectSuggestion,
         handleChat,
         setShowProducts,
         setFullscreen,
         keywords,
         setProductKeywords,
         handleShowFrame,
         handleChatbotOpened,
         signInRedirect = false,
         setSignInRedirect = () => {},
         setLoading = () => {}
    }) => {

        const talonProps = useProducts({
            skus,
            keywords,
            setFullscreen,
            setProductKeywords,
            setShowProducts,
            handleShowFrame
        });

        const {
            isMobile,
            itemsLoading,
            suggestItems,
            showSliderMobile,
            setShowSliderMobile,
            keywordsCurrentData,
            showProductsCurrentData,
            setShowProductsCurrentData,
            setKeywordsCurrentData,
            handleOpenMore
        } = talonProps;

        const { formatMessage } = useIntl();
        const [, { addToast }] = useToasts();
        const [{ isSignedIn }] = useUserContext();
        const [{ cartId }] = useCartContext();
        const history = useHistory();
        const ref = useRef(null);
        const { onMouseDown } = useDraggableScroll(ref);

        const [reorder, { data:reorderData, loading:reorderLoading, error:reorderError }] = useMutation(
            REORDER,
            {
                fetchPolicy: 'no-cache',
                onCompleted: () => {
                    history.push('/cart');
                    handleChatbotOpened(false);
                    setLoading(false);
                }
            }
        );
        const [reorderGuest, { loading:reorderGuestLoading, error:reorderGuestError }] = useMutation(
            REORDER_GUEST_MUTATION,
            {
                fetchPolicy: 'no-cache',
                skip: isSignedIn,
                onCompleted: () => {
                    history.push('/cart');
                    handleChatbotOpened(false);
                    setLoading(false);
                }
            }
        );
        const handleReOrder = useCallback( (orderNumber) => {
            setLoading(true);
            reorder({
                variables: {
                    orderNumber: orderNumber
                }
            }).then(response => {
                setLoading(false);
                if (response.errors) {
                    response.errors && response.errors.map(error => (
                        addToast({
                            type: 'error',
                            icon: errorIcon,
                            message: error.message,
                            dismissable: true,
                            timeout: 5000
                        })
                    ))
                }
            }).catch(error => {
                setLoading(false);
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: error.message || 'An unexpected error occurred.',
                    dismissable: true,
                    timeout: 5000
                })
            });
        }, [reorder]);
        const handleReOrderGuest = useCallback( (orderNumber) => {
            setLoading(true);
            reorderGuest({
                variables: {
                    input: {
                        cart_id: cartId,
                        order_number: orderNumber
                    }
                }
            }).then(response => {
                setLoading(false);
                if (response.errors) {
                    response.errors && response.errors.map(error => (
                        addToast({
                            type: 'error',
                            icon: errorIcon,
                            message: error.message,
                            dismissable: true,
                            timeout: 5000
                        })
                    ))
                }
            }).catch(error => {
                setLoading(false);
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: error.message || 'An unexpected error occurred.',
                    dismissable: true,
                    timeout: 5000
                })
            });
        }, [cartId, reorderGuest]);

        if (!html) return null;

        const orderInfo = order?.[0] ? (order?.[0]?.items || order) : null;

        return (
            <>
                <div className={classes.botMessage}>
                    <span className={classes.botAvt}></span>
                    <div className={classes.content}>
                        <div className={`${classes.inner} ${orderInfo?.length ? classes.wFull : ''}`}>
                            <div className={classes.messageText}>{renderContent(html)}</div>
                            {cart?.[0]?.items?.length ? (
                                <div>
                                    <ul className={classes.cart}>
                                        {cart[0].items.map((item) => (
                                            <li key={item.product.sku}>
                                                {`${item.product.ecom_name || item.product.name} - SKU: ${item.product.art_no || item.product.sku}`}
                                                {item.prices?.price_including_tax ? (
                                                    <>
                                                        {' - '}
                                                        <FormattedMessage
                                                            id={'chatbot.price'}
                                                            defaultMessage={'Price'}
                                                        />{': '}
                                                        <Price
                                                            value={item.prices.price_including_tax.value}
                                                            currencyCode={item.prices.price_including_tax.currency}
                                                        />
                                                    </>
                                                ) : null}
                                                {item.quantity ? (
                                                    <>
                                                        {' - '}
                                                        <FormattedMessage
                                                            id={'chatbot.qty'}
                                                            defaultMessage={'Qty'}
                                                        />{`: ${item.quantity}`}
                                                    </>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                    {cart[0].prices?.grand_total?.value ? (
                                        <>
                                            <p className={classes.cartTotal}>
                                                <FormattedMessage
                                                    id={'chatbot.cartTotal'}
                                                    defaultMessage={'Total estimated payment: '}
                                                />
                                                <span className={classes.value}>
                                                <Price
                                                    value={cart[0].prices.grand_total.value}
                                                    currencyCode={cart[0].prices.grand_total.currency}
                                                />
                                            </span>
                                            </p>
                                            <p className={classes.cartNote}>
                                                <FormattedMessage
                                                    id={'chatbot.cartInfo'}
                                                    defaultMessage={'Promotions and shipping fees are not included. For exact details, please select payment to get full promotion and shipping fees applied.'}
                                                />
                                            </p>
                                        </>
                                    ) : null}
                                </div>
                            ) : (
                                <>
                                    {orderInfo?.length ? (
                                        <>
                                            {orderInfo?.[0]?.all_items?.length ? (
                                                <div>
                                                    <ul className={classes.cart}>
                                                        {orderInfo[0].all_items.map((item) => (
                                                            <li key={item.sku}>
                                                                {`${item.product_name} - SKU: ${item.art_no || item.sku}`}
                                                                {item.price ? (
                                                                    <>
                                                                        {' - '}
                                                                        <FormattedMessage
                                                                            id={'chatbot.price'}
                                                                            defaultMessage={'Price'}
                                                                        />{': '}
                                                                        <Price
                                                                            value={item.price}
                                                                            currencyCode={item.currency}
                                                                        />
                                                                    </>
                                                                ) : null}
                                                                {item.quantity ? (
                                                                    <>
                                                                        {' - '}
                                                                        <FormattedMessage
                                                                            id={'chatbot.qty'}
                                                                            defaultMessage={'Qty'}
                                                                        />{`: ${item.quantity}`}
                                                                    </>
                                                                ) : null}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {orderInfo[0].grand_total ? (
                                                        <>
                                                            <p className={classes.cartTotal}>
                                                                <FormattedMessage
                                                                    id={'global.totalPayment'}
                                                                    defaultMessage={'Total payment'}
                                                                />{': '}
                                                                <span className={classes.value}>
                                                                    <Price
                                                                        value={orderInfo[0].grand_total}
                                                                        currencyCode={orderInfo[0].currency}
                                                                    />
                                                                </span>
                                                            </p>
                                                        </>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <div className={classes.order}>
                                                    <div className={classes.orderListWrapper}
                                                         ref={ref}
                                                         onMouseDown={onMouseDown}>
                                                        <ul className={classes.orderList}>
                                                            {orderInfo.slice(0, 2).map((item) => (
                                                                <li className={classes.orderItem} key={item.order_number}>
                                                                    {item.item ? (
                                                                        <div className={classes.firstItem}>
                                                                    <span className={classes.productImage}>
                                                                        <img src={item.item.image_url} alt={item.item.product_name}/>
                                                                    </span>
                                                                            <div className={classes.productInfo}>
                                                                                <p className={classes.productName}>
                                                                                    <span className={classes.name}>{item.item.product_name}</span>
                                                                                    <span className={classes.qty}>{`x${item.item.quantity}`}</span>
                                                                                </p>
                                                                                {item.total_items > 1 ? (
                                                                                    <p className={classes.remaining}>
                                                                                        {`+ ${item.total_items - 1} ${formatMessage({ id: 'botMessage.otherProduct', defaultMessage: 'other products' })}`}
                                                                                    </p>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                    <div className={classes.orderInfo}>
                                                                        <p className={classes.statusWrapper}>
                                                                            <strong className={classes.orderNumber}>{`#${item.order_number}`}</strong>
                                                                            <span className={`${classes.status} ${classes[`status-${item.state}`]}`}><span>{item.status}</span></span>
                                                                        </p>
                                                                        {item.delivery_information?.delivery_date ? (
                                                                            <p>
                                                                    <span className={classes.label}>
                                                                        <FormattedMessage
                                                                            id={'botMessage.deliveryEstimated'}
                                                                            defaultMessage={'Estimated delivery time:'}
                                                                        />
                                                                    </span>
                                                                                <span className={classes.value}>{formatDate(item.delivery_information.delivery_date)}</span>
                                                                            </p>
                                                                        ) : null}
                                                                        <p className={classes.orderTotal}>
                                                                    <span className={classes.label}>
                                                                        <FormattedMessage
                                                                            id={'botMessage.orderTotal'}
                                                                            defaultMessage={'Total amount:'}
                                                                        />
                                                                    </span>
                                                                            <span className={classes.value}>
                                                                        <Price
                                                                            value={item.grand_total}
                                                                            currencyCode={item.currency}
                                                                        />
                                                                    </span>
                                                                        </p>
                                                                    </div>
                                                                    <div className={classes.orderActions}>
                                                                        <button type='button' className={classes.reorder}
                                                                                onClick={() => {
                                                                                    if (isSignedIn) {
                                                                                        handleReOrder(item.order_number)
                                                                                    } else {
                                                                                        handleReOrderGuest(item.order_number)
                                                                                    }
                                                                                }}
                                                                        >
                                                                            <FormattedMessage
                                                                                id={'botMessage.reOrder'}
                                                                                defaultMessage={'Reorder'}
                                                                            />
                                                                        </button>
                                                                        <Link className={classes.viewOrder} to={isSignedIn ? `/order/${item.order_number}` : `/order-tracking?id=${item.order_number}&email=${item.email || ''}`}
                                                                              onClick={() => handleChatbotOpened(false)}>
                                                                            <FormattedMessage
                                                                                id={'botMessage.viewDetails'}
                                                                                defaultMessage={'View details'}
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    {isSignedIn && order?.[0]?.items?.length ? (
                                                        <Link className={classes.viewAllOrders} to={`/order-history`}
                                                              onClick={() => handleChatbotOpened(false)}>
                                                            <FormattedMessage
                                                                id={'botMessage.viewAllOrders'}
                                                                defaultMessage={"View all orders"}
                                                            />
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {skus?.length ? (
                                                <ProductBySkus
                                                    classes={classes}
                                                    skus={skus}
                                                    items={suggestItems}
                                                    loading={itemsLoading}
                                                    handleChatbotOpened={handleChatbotOpened}
                                                    setFullscreen={setFullscreen}
                                                    keywords={keywords}
                                                    setProductKeywords={setProductKeywords}
                                                    handleOpenMore={handleOpenMore}
                                                    handleShowFrame={handleShowFrame}
                                                    showSliderMobile={showSliderMobile}
                                                />
                                            ) : null }
                                            {closingHtml ? <div className={classes.closing}>{renderContent(closingHtml)}</div> : null}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {isMobile && showSliderMobile && (skus?.length) ? (
                    <>
                        {keywordsCurrentData?.queries?.length ? (
                            <div className={classes.productSlider}>
                                <ProductGroupKeywords
                                    classes={classes}
                                    productKeywords={keywordsCurrentData}
                                    showProducts={showProductsCurrentData}
                                    setShowProducts={setShowProductsCurrentData}
                                    handleShowFrame={handleShowFrame}
                                    handleChatbotOpened={handleChatbotOpened}
                                    setSignInRedirect={setSignInRedirect}
                                />
                            </div>
                        ) : (
                            <div className={classes.productSlider}>
                                <ProductGalleryBySkus
                                    skus={skus}
                                    classes={classes}
                                    handleShowFrame={handleShowFrame}
                                    handleChatbotOpened={handleChatbotOpened}
                                    setSignInRedirect={setSignInRedirect}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {(skus?.length) ? (
                            <ProductMessageExtend
                                items={suggestItems}
                                loading={itemsLoading}
                                handleShowFrame={handleShowFrame}
                                handleChatbotOpened={handleChatbotOpened}
                                handleOpenMore={handleOpenMore}
                                setSignInRedirect={setSignInRedirect}
                            />
                        ) : null}
                        {(cta?.length) ? (
                            <div className={classes.suggestions}>
                                {cta.map((item, index) => {
                                    if (item === 'continueCTA') {
                                        return (
                                            <button
                                                key={index}
                                                className={classes.suggestion}
                                                onClick={() => handleSelectSuggestion(formatMessage({ id: 'chatbot.continueShopping', defaultMessage: 'Continue shopping' }))}
                                            >
                                                <FormattedMessage
                                                    id={'chatbot.continueShopping'}
                                                    defaultMessage={'Continue shopping'}
                                                />
                                            </button>
                                        )
                                    } else if (item === 'cartCTA') {
                                        return (
                                            <Link
                                                to={'/cart'}
                                                key={index}
                                                className={classes.suggestion}
                                                onClick={() => handleChatbotOpened(false)}
                                            >
                                                <FormattedMessage
                                                    id={'chatbot.viewCart'}
                                                    defaultMessage={'View cart details'}
                                                />
                                            </Link>
                                        )
                                    } else if (item === 'checkoutCTA') {
                                        return (
                                            <Link
                                                to={'/checkout'}
                                                key={index}
                                                className={classes.suggestion}
                                                onClick={() => handleChatbotOpened(false)}
                                            >
                                                <FormattedMessage
                                                    id={'chatbot.viewCheckout'}
                                                    defaultMessage={'Checkout now'}
                                                />
                                            </Link>
                                        )
                                    } else if (item === 'supportCTA') {
                                        return (
                                            <button
                                                key={index}
                                                className={classes.suggestion}
                                                onClick={handleChat}
                                            >
                                                <FormattedMessage
                                                    id={'global.supportNow'}
                                                    defaultMessage={'Support now'}
                                                />
                                            </button>
                                        )
                                    } else if (item === 'signinAccountCTA') {
                                        return (
                                            <Link
                                                to={'/sign-in?referer=L2FjY291bnQtaW5mb3JtYXRpb24='}
                                                key={index}
                                                className={classes.suggestion}
                                                onClick={() => handleChatbotOpened(false)}
                                            >
                                                <FormattedMessage
                                                    id={'global.signIn'}
                                                    defaultMessage={'Sign in'}
                                                />
                                            </Link>
                                        )
                                    } else if (item === 'signinAddressCTA') {
                                        return (
                                            <Link
                                                to={'/sign-in?referer=L2FkZHJlc3MtYm9vaz9hZGQ9dHJ1ZQ=='}
                                                key={index}
                                                className={classes.suggestion}
                                                onClick={() => handleChatbotOpened(false)}
                                            >
                                                <FormattedMessage
                                                    id={'global.signIn'}
                                                    defaultMessage={'Sign in'}
                                                />
                                            </Link>
                                        )
                                    } else if (item === 'signinOrderCTA') {
                                        return (
                                            <Link
                                                to={'/sign-in?referer=L29yZGVyLWhpc3Rvcnk='}
                                                key={index}
                                                className={classes.suggestion}
                                                onClick={() => handleChatbotOpened(false)}
                                            >
                                                <FormattedMessage
                                                    id={'global.signIn'}
                                                    defaultMessage={'Sign in'}
                                                />
                                            </Link>
                                        )
                                    }
                                })}
                            </div>
                        ) : null}
                    </>
                )}
                {orderInfo?.[0]?.all_items?.length ? (
                    <div className={classes.suggestions}>
                        <Link
                            to={isSignedIn ? `/order/${orderInfo[0].order_number}` : `/order-tracking?id=${orderInfo[0].order_number}&email=${orderInfo[0].email || ''}`}
                            className={classes.suggestion}
                            onClick={() => handleChatbotOpened(false)}
                        >
                            <FormattedMessage
                                id={'botMessage.viewOrderDetails'}
                                defaultMessage={'View order details'}
                            />
                        </Link>
                    </div>
                ) : null}
            </>
        );
    });

export default BotMessage;
