import React, { Fragment, useEffect, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Lock as LockIcon,
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import { bool, shape, string } from 'prop-types';
import { CloseGray } from '@magenest/theme/static/icons';
import { useToasts } from '@magento/peregrine';
import Price from '@magento/venia-ui/lib/components/Price';
import { useMiniCart } from '../../Talons/MiniCart/useMiniCart';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { CartEmpty } from '@magenest/theme/static/icons';
import Button from '../Button/button';
import Icon from '@magento/venia-ui/lib/components/Icon';
import StockStatusMessage from '@magento/venia-ui/lib/components/StockStatusMessage';
import ProductList from '@magento/venia-ui/lib/components/MiniCart/ProductList';
import defaultClasses from '@magento/venia-ui/lib/components/MiniCart/miniCart.module.css';
import miniCartClasses from '@magenest/theme/BaseComponents/MiniCart/extendStyle/miniCart.module.scss';
import operations from '@magento/venia-ui/lib/components/MiniCart/miniCart.gql';
import { MiniCartContext } from '@magenest/theme/Context/MiniCart/MiniCartContext';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 * The MiniCart component shows a limited view of the user's cart.
 *
 * @param {Boolean} props.isOpen - Whether or not the MiniCart should be displayed.
 * @param {Function} props.setIsOpen - Function to toggle mini cart
 */
const MiniCart = React.forwardRef((props, ref) => {
    const { isOpen, handleLinkClick, handleClose } = props;
    const { setMiniCartProductList, setMiniCartInfo } = useContext(MiniCartContext);

    // Prevent the page from scrolling in the background
    // when the MiniCart is open.
    // useScrollLock(isOpen);

    const talonProps = useMiniCart({
        isOpen,
        operations
    });

    const {
        closeMiniCart,
        errorMessage,
        handleEditCart,
        handleProceedToCheckout,
        handleRemoveItem,
        loading,
        productList,
        subTotal,
        totalQuantity,
        configurableThumbnailSource,
        storeUrlSuffix,
        handleRemoveAllCart,
        revenue
    } = talonProps;

    const classes = useStyle(defaultClasses, miniCartClasses, props.classes);
    const rootClass = isOpen ? classes.root_open : classes.root_closed;
    const contentsClass = isOpen ? classes.contents_open : classes.contents;
    const quantityClassName = loading
        ? classes.quantity_loading
        : classes.quantity;
    const priceClassName = loading ? classes.priceBox_loading : classes.priceBox;

    const isCartEmpty = !(productList && productList.length);

    const [, { addToast }] = useToasts();

    const announceMiniCartCount = 'There are no items in your cart.';

    useEffect(() => {
        if (errorMessage) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorMessage,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, errorMessage]);

    useEffect(() => {
        if (productList && productList.length > 0) {
            const reducedProductList = productList.reduce((acc, item) => {
                acc[item.product.uid] = {
                    quantity: item.quantity,
                    cart_item_uid: item.uid
                };
                return acc;
            }, {});
            setMiniCartProductList(reducedProductList);
        } else {
            setMiniCartProductList({});
        }
    }, [productList, setMiniCartProductList]);

    useEffect(() => {
        if (subTotal && totalQuantity) {
            setMiniCartInfo({
                cart_subtotal: subTotal.value,
                cart_item_count: totalQuantity,
                revenue: revenue.value
            })
        }
    }, [subTotal, totalQuantity, revenue])

    const header = subTotal ? (
        <Fragment>
            <div className={classes.head}>
                <div className={classes.titleWrapper}>
                    <strong className={classes.title}>
                        <FormattedMessage
                            id={'global.cart'}
                            defaultMessage={'My Cart'}
                        />
                    </strong>
                    <span
                        data-cy="MiniCart-totalQuantity"
                        className={quantityClassName}
                    >
                        (
                            <FormattedMessage
                                id={'global.totalQuantity'}
                                defaultMessage={'{totalQuantity} Items'}
                                values={{totalQuantity}}
                            />
                        )
                    </span>
                </div>
                <button onClick={handleClose} className={classes.buttonClose} type={'button'}>
                    <FormattedMessage
                        id={'global.close'}
                        defaultMessage={'Close'}
                    />
                    <img src={CloseGray} alt={'close'}/>
                </button>
            </div>
        </Fragment>
    ) : null;

    const contents = isCartEmpty ? (
        <div className={classes.emptyCart}>
            <img src={CartEmpty} alt={''} />
            <div
                className={classes.emptyMessage}
                data-cy="MiniCart-emptyMessage"
            >
                <FormattedMessage
                    id={'miniCart.emptyMessage'}
                    defaultMessage={'There are no products in the cart.'}
                />
            </div>
        </div>
    ) : (
        <Fragment>
            <p className={classes.miniCartNote}>
                <FormattedMessage
                    id={'miniCart.note1'}
                    defaultMessage={'Returns and exchanges are not applicable to '}
                />
                <span>
                    <FormattedMessage
                        id={'miniCart.note2'}
                        defaultMessage={'fresh food or frozen products.'}
                    />
                </span>
            </p>
            <div className={classes.stockStatusMessageContainer}>
                <StockStatusMessage cartItems={productList}/>
            </div>
            <div className={classes.body} data-cy="MiniCart-body">
                <ProductList
                    items={productList}
                    loading={loading}
                    handleRemoveItem={handleRemoveItem}
                    closeMiniCart={closeMiniCart}
                    configurableThumbnailSource={configurableThumbnailSource}
                    storeUrlSuffix={storeUrlSuffix}
                    totalQuantity={totalQuantity}
                />
            </div>
            <div className={classes.footerHead}>
                <button onClick={handleRemoveAllCart} className={classes.buttonRemoveAll}>
                    <FormattedMessage
                        id={'global.removeAll'}
                        defaultMessage={'Remove all'}
                    />
                </button>
                <div className={classes.priceBox}>
                        <span className={classes.label}>
                            <FormattedMessage
                                id={'global.totalAmount'}
                                defaultMessage={'Total amount'}
                            />
                        </span>
                    <span className={classes.price}>
                            <Price
                                currencyCode={subTotal.currency}
                                value={subTotal.value}
                            />
                        </span>
                </div>
            </div>
            <div className={classes.footer}>
                {/*<Button*/}
                {/*    onClick={handleProceedToCheckout}*/}
                {/*    priority="high"*/}
                {/*    disabled={loading || isCartEmpty}*/}
                {/*    data-cy="Minicart-checkoutButton"*/}
                {/*>*/}
                {/*    <FormattedMessage*/}
                {/*        id={'miniCart.checkout'}*/}
                {/*        defaultMessage={'CHECKOUT'}*/}
                {/*    />*/}
                {/*</Button>*/}
                <Button
                    onClick={handleEditCart}
                    priority="high"
                    data-cy="Minicart-editCartButton"
                >
                    <FormattedMessage
                        id={'miniCart.viewCart'}
                        defaultMessage={'View cart'}
                    />
                </Button>
            </div>
        </Fragment>
    );

    return (
        <aside className={rootClass} data-cy="MiniCart-root">
            <div ref={ref} className={contentsClass}>
                <div className={classes.header}>{header}</div>
                {contents}
            </div>
        </aside>
    );
});

export default MiniCart;

MiniCart.propTypes = {
    classes: shape({
        root: string,
        root_closed: string,
        root_open: string,
        contents: string,
        contents_open: string,
        header: string,
        body: string,
        footer: string,
        checkoutButton: string,
        editCartButton: string,
        emptyCart: string,
        emptyMessage: string,
        stockStatusMessageContainer: string
    }),
    isOpen: bool
};
