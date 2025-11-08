import React, { Fragment, Suspense } from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import { func, string, shape } from 'prop-types';
import { useShippingInformation } from '../../../Talons/CheckoutPage/ShippingInformation/useShippingInformation';

import { useStyle } from '@magento/venia-ui/lib/classify';
import GuestForm from './AddressForm/guestForm';
import Card from './card';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/shippingInformation.module.css';
import shippingInformationClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/shippingInformation.module.scss';
import SlideToggle from "react-slide-toggle";
import MCard from "../../../../@theme/BaseComponents/CheckoutPage/components/Mcard";
import DeliveryTime from "../../../../@theme/BaseComponents/CheckoutPage/components/DeliveryTime/deliveryTime";
import IncludeVat from "../../../../@theme/BaseComponents/CheckoutPage/components/IncludeVAT/includeVat";
import Modal from "../../../../@theme/BaseComponents/Modal";
import Image from "@magento/venia-ui/lib/components/Image";
import Price from "@magento/venia-ui/lib/components/Price";
import Button from "@magento/venia-ui/lib/components/Button";
import AddressBook from "../AddressBook/addressBook";
import {CartChange} from "../../../../@theme/static/icons";

// const EditModal = React.lazy(() => import('@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/editModal'));

const ShippingInformation = props => {
    const {
        classes: propClasses,
        setCheckoutStep,
        CHECKOUT_STEP,
        checkoutStep,
        deliveryDate,
        setDeliveryDate,
        isOpen,
        handleCloseChangeStore,
        cartItems,
        storeViewData,
        setIsContinue,
        setSelectedAddressId,
        selectedAddressId,
        setLoading,
        isGuestCheckout,
        isDeliveryTimeInit,
        setIsDeliveryTimeInit,
        doneGuestSubmit,
        setDoneGuestSubmit,
        setSelectedAddress,
        selectedAddress
    } = props;
    const { formatMessage } = useIntl();
    const talonProps = useShippingInformation({
        setCheckoutStep,
        CHECKOUT_STEP,
        storeViewData,
        setIsContinue,
        handleCloseChangeStore
    });
    const {
        handleEditShipping,
        hasUpdate,
        isReady,
        isSignedIn,
        shippingData,
        doneEditing,
        vatInformation,
        isExportVat,
        setIsExportVat,
        vatCompany,
        setVatCompany,
        handleSwitchStore,
        customerData,
        deliveryDateInformation,
        showModalPriceChange,
        setShowModalPriceChange
    } = talonProps;

    const classes = useStyle(defaultClasses, shippingInformationClasses, propClasses);

    const rootClassName = !doneEditing
        ? classes.root_editMode
        : hasUpdate
            ? classes.root_updated
            : classes.root;

    const addressBookElement = !isGuestCheckout && checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS ? (
        <AddressBook
            setSelectedAddressId={setSelectedAddressId}
            shippingData={shippingData}
            setSelectedAddress={setSelectedAddress}
            selectedAddress={selectedAddress}
        />
    ) : null;

    const shippingInformation = doneEditing && checkoutStep === CHECKOUT_STEP.PAYMENT ? (
        <Fragment>
            <Card
                handleEditShipping={handleEditShipping}
                shippingData={shippingData}
                checkoutStep={checkoutStep}
                isSignedIn={isSignedIn}
                isExportVat={isExportVat}
                deliveryDate={deliveryDate}
                vatCompany={vatCompany}
            />
        </Fragment>
    ) : (
        !isSignedIn ? (
            <div className={classes.editWrapper}>
                <GuestForm
                    isReady={isReady}
                    shippingData={shippingData}
                    setDoneGuestSubmit={setDoneGuestSubmit}
                    setSelectedAddressId={setSelectedAddressId}
                    selectedAddressId={selectedAddressId}
                    setLoading={setLoading}
                />
            </div>
        ) : (
            <div className={classes.customerInformation}>
                <div className={`${classes.blockTitle} ${classes.titleNotToggle}`}>
                    <span>
                        <FormattedMessage
                            id={'global.customerInformation'}
                            defaultMessage={'Customer information'}
                        />
                    </span>
                </div>
                <div className={classes.blockContent}>
                    <p className={classes.customerItem}>
                        <span className={classes.label}>
                            <FormattedMessage
                                id={'global.customerName'}
                                defaultMessage={'Customer name'}
                            />:
                        </span>
                        <span className={classes.value}>
                            {customerData?.firstname || ''}
                        </span>
                    </p>
                    <p className={classes.customerItem}>
                        <span className={classes.label}>
                            <FormattedMessage
                                id={'global.telephone'}
                                defaultMessage={'Phone number'}
                            />:
                        </span>
                        <span className={classes.value}>
                            {customerData?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || ''}
                        </span>
                    </p>
                    <p className={classes.customerItem}>
                        <span className={classes.label}>
                            <FormattedMessage
                                id={'global.email'}
                                defaultMessage={'Email'}
                            />:
                        </span>
                        <span className={classes.value}>
                            {customerData?.email || ''}
                        </span>
                    </p>
                </div>
            </div>
        )
    );

    const sortedStores = storeViewData?.storeView?.store_view_code && [...storeViewData.storeView.store_view_code].sort((a, b) => {
        if (a.distance !== b.distance) {
            return Number(a.distance) - Number(b.distance);
        }
        return Number(a.priority) - Number(b.priority);
    }) || [];

    return (
        <div className={rootClassName} data-cy="ShippingInformation-root">
            <SlideToggle>
                {({toggle, setCollapsibleElement, toggleState}) => (
                    <div className={classes.block}>
                        {
                        checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS && (
                                <div
                                    className={`${classes.blockTitle} ${toggleState === 'EXPANDED' ? classes.collapsed : ''}`}
                                    onClick={toggle}>
                                    {
                                        isSignedIn ? (
                                            <strong>
                                                <FormattedMessage
                                                    id={'global.accountInformation'}
                                                    defaultMessage={'My profile'}
                                                />
                                            </strong>
                                        ) : (
                                            <strong>
                                                <FormattedMessage
                                                    id={'checkoutPage.shippingGuestTitle'}
                                                    defaultMessage={'Purchase without login'}
                                                />
                                            </strong>
                                        )
                                    }
                                </div>
                            )
                        }
                        <div className={classes.blockContent} ref={setCollapsibleElement}>
                            {shippingInformation}
                            {
                                checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS && (
                                    <MCard
                                        customerNo={customerData?.customer_no || ''}
                                    />
                                )
                            }
                            {addressBookElement}
                            {
                                checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS && (
                                    <>
                                        <DeliveryTime
                                            deliveryDate={deliveryDate}
                                            setDeliveryDate={setDeliveryDate}
                                            isExportVat={isExportVat}
                                            doneEditing={doneEditing}
                                            doneGuestSubmit={doneGuestSubmit}
                                            setLoading={setLoading}
                                            deliveryDateInformation={deliveryDateInformation}
                                            isDeliveryTimeInit={isDeliveryTimeInit}
                                            setIsDeliveryTimeInit={setIsDeliveryTimeInit}
                                        />
                                        <IncludeVat
                                            vatInformation={vatInformation}
                                            isExportVat={isExportVat}
                                            setIsExportVat={setIsExportVat}
                                            deliveryDate={deliveryDate}
                                            doneEditing={doneEditing}
                                            vatCompany={vatCompany}
                                            setVatCompany={setVatCompany}
                                            setLoading={setLoading}
                                            doneGuestSubmit={doneGuestSubmit}
                                        />
                                    </>
                                )
                            }
                        </div>
                    </div>
                )}
            </SlideToggle>
            {
                isOpen && (
                    <Modal
                        title={formatMessage({
                            id: 'global.notification',
                            defaultMessage: 'Notification'
                        })}
                        isOpen={isOpen}
                        handleClose={handleCloseChangeStore}
                        classes={{
                            innerWidth: classes.innerWidth
                        }}
                        isMask={true}
                    >
                        <div className={classes.modalChangeStore}>
                            <p className={classes.changeStoreContent}>
                                {
                                    storeViewData?.storeView?.allow_selection ? (
                                        <>
                                            <span className={classes.titleAllowSelection}>
                                                <FormattedMessage
                                                    id={'changeStoreModal.titleAllowSelection'}
                                                    defaultMessage={'Your delivery address is within the service area of two MM Mega Market centers.'}
                                                />
                                            </span>
                                            <span>
                                                <FormattedMessage
                                                    id={'changeStoreModal.descriptionAllowSelection'}
                                                    defaultMessage={`We recommend transferring your order to <strong>{storeFirst}</strong> to optimize delivery fees and time. You can still choose <strong>{storeSecond}</strong> if you prefer, but please note that additional costs or delivery time may apply.`}
                                                    values={{
                                                        strong: chunks => (
                                                            <strong>{chunks}</strong>
                                                        ),
                                                        storeFirst: sortedStores[0].source_name,
                                                        storeSecond: sortedStores[1].source_name
                                                    }}
                                                />
                                            </span>
                                        </>
                                    ) : (
                                        <span>
                                            <FormattedMessage
                                                id={'changeStoreModal.storeInformation'}
                                                defaultMessage={'Your delivery address falls under <strong>{store}</strong>. To serve you better and optimize delivery costs, MM will transfer your order to this center for processing.'}
                                                values={{
                                                    strong: chunks => (
                                                        <strong>{chunks}</strong>
                                                    ),
                                                    store: sortedStores?.[0]?.source_name || ''
                                                }}
                                            />
                                        </span>
                                    )
                                }
                            </p>
                            <SlideToggle>
                                {({toggle, setCollapsibleElement, toggleState}) => (
                                    <div className={classes.modalBlock}>
                                        <div
                                            className={`${classes.modalBlockTitle} ${toggleState === 'EXPANDED' ? classes.collapsed : ''}`}
                                            onClick={toggle}>
                                            <span>
                                                <FormattedMessage
                                                    id={'changeStoreModal.statusProductTitle'}
                                                    defaultMessage={'The status of products at '}
                                                />
                                            <strong>
                                                {sortedStores[0]?.source_name || ''}
                                            </strong>
                                            </span>
                                        </div>
                                        <div className={classes.blockContent} ref={setCollapsibleElement}>
                                            {
                                                cartItems && cartItems.map((item, index) => (
                                                    <div className={classes.product} key={item.uid}>
                                                        <div className={classes.image}>
                                                            <Image
                                                                alt={item.product.name}
                                                                resource={item.product.thumbnail.url}
                                                                width={60}
                                                                height={60}
                                                            />
                                                        </div>
                                                        <div className={classes.details}>
                                                            <p className={classes.name}>
                                                                {item.product.name}
                                                            </p>
                                                        </div>
                                                        <span className={classes.stockStatus}>
                                                            {
                                                                item.product.stock_status === 'IN_STOCK' ? (
                                                                    <FormattedMessage
                                                                        id={'global.inStock'}
                                                                        defaultMessage={'In stock'}
                                                                    />
                                                                ) : (
                                                                    <FormattedMessage
                                                                        id={'global.outOfStock'}
                                                                        defaultMessage={'Out of stock'}
                                                                    />
                                                                )
                                                            }
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <div className={classes.modalFooter}>
                                            {
                                                sortedStores.length > 1 ? (
                                                    <>
                                                        {
                                                            sortedStores.map((store, index) => (
                                                                <Button
                                                                    priority={index === 0 ? 'high' : 'low'}
                                                                    onClick={() => handleSwitchStore(store.store_view_code)}
                                                                    key={store.store_view_code}
                                                                >
                                                                    <p className={classes.buttonTitle}>
                                                                        {store.source_name}
                                                                    </p>
                                                                    <p className={classes.buttonDescription}>
                                                                        {index === 0 ? (
                                                                            <FormattedMessage
                                                                                id={'storeInformationPopup.buttonPrimaryDescription'}
                                                                                defaultMessage={'(Delivery fee is optimized)'}
                                                                            />
                                                                        ) : (
                                                                            <FormattedMessage
                                                                                id={'storeInformationPopup.buttonSecondaryDescription'}
                                                                                defaultMessage={'(Additional shipping fees may apply)'}
                                                                            />
                                                                        )}
                                                                    </p>
                                                                </Button>
                                                            ))
                                                        }
                                                    </>
                                                ) : (
                                                    <Button
                                                        priority={'high'}
                                                        onClick={() => handleSwitchStore(storeViewData.storeView.store_view_code[0].store_view_code)}
                                                    >
                                                        <p className={classes.buttonTitle}>
                                                            <FormattedMessage
                                                                id={'global.agree'}
                                                                defaultMessage={'Agree'}
                                                            />
                                                        </p>
                                                        <p className={classes.buttonDescription}>
                                                            <FormattedMessage
                                                                id={'storeInformationPopup.buttonPrimaryDescription'}
                                                                defaultMessage={'(Delivery fee is optimized)'}
                                                            />
                                                        </p>
                                                    </Button>
                                                )
                                            }
                                        </div>
                                    </div>
                                )}
                            </SlideToggle>
                        </div>
                    </Modal>
                )
            }
            {
                showModalPriceChange && (
                    <Modal
                        title={formatMessage({
                            id: 'global.notification',
                            defaultMessage: 'Notification'
                        })}
                        isOpen={showModalPriceChange}
                        handleClose={() => setShowModalPriceChange(false)}
                        isMask={true}
                        classes={{
                            innerWidth: classes.modalPriceChangeInnerWidth
                        }}
                    >
                        <div className={classes.priceChangeModal}>
                            <img src={CartChange} alt={''} />
                            <span className={classes.description}>
                                <FormattedMessage
                                    id={'global.priceChangeModalText'}
                                    defaultMessage={'Your cart has been updated, please check'}
                                />
                            </span>
                            <Button priority={'high'} onClick={() => setShowModalPriceChange(false)}>
                                <FormattedMessage
                                    id={'global.confirm'}
                                    defaultMessage={'Confirm'}
                                />
                            </Button>
                        </div>
                    </Modal>
                )
            }
        </div>
    );
};

export default ShippingInformation;

ShippingInformation.propTypes = {
    classes: shape({
        root: string,
        root_editMode: string,
        cardHeader: string,
        cartTitle: string,
        editWrapper: string,
        editTitle: string,
        editButton: string,
        editIcon: string,
        editText: string
    })
};
