import React, {useState, useCallback, useRef} from 'react';
import {from, useMutation} from "@apollo/client";
import {Link, useParams, useHistory} from 'react-router-dom';
import { useStyle } from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderDetailPage.module.scss';
import accountClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/account.module.scss';
import MyAccountLayout from "../MyAccount/myAccountLayout";
import Button from '@magento/venia-ui/lib/components/Button';
import OrderDetail from "./orderDetail";
import DeliveryTracking from "./deliveryTracking";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import { REORDER } from './reorder.gql';
import { FormattedMessage } from 'react-intl';
import {useToasts} from "@magento/peregrine";
import {AlertCircle as AlertCircleIcon} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
import { Print } from "@magenest/theme/static/icons";
import { useReactToPrint } from 'react-to-print';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const history = useHistory();
    const [, { addToast }] = useToasts();
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({
        content: () => contentRef.current,
        removeAfterPrint: false
    });

    const classes = useStyle(defaultClasses, accountClasses);

    const [isOpenSidebar, setIsOpenSidebar] = useState(false);
    const [isDeliveryTracking, setIsDeliveryTracking] = useState(false);

    const [reorder, { data:reorderData, loading:reorderLoading, error:reorderError }] = useMutation(
        REORDER,
        {
            fetchPolicy: 'no-cache',
            onCompleted: () => {
                history.push('/cart');
            }
        }
    );
    const handleReOrder = useCallback( () => {
        reorder({
            variables: {
                orderNumber: orderId
            }
        }).then(response => {
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
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message || 'An unexpected error occurred.',
                dismissable: true,
                timeout: 5000
            })
        });
    }, [orderId, reorder]);

    return (
        <MyAccountLayout currentPage={'orderManagement'} isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar}>
            <h2 className={`${classes.currentPageTitle} ${classes.orderPageTitle}`}>
                <Link to={'/order-history'} className={`${classes.backButton} ${classes.backParent}`}>
                    <span>{'<'}</span>
                </Link>
                <span>
                    <FormattedMessage
                        id={'global.orderDetails'}
                        defaultMessage={'Order Details'}
                    />
                </span>
                {!isDeliveryTracking && (
                    <div className={`${classes.actions} ${classes.orderActions}`}>
                        <div className={classes.printButton}>
                            <Button priority='normal' onClick={reactToPrintFn}>
                                <img src={Print} alt={''} />
                            </Button>
                        </div>
                        <Button type="button" priority="high" onClick={handleReOrder}>
                            <FormattedMessage
                                id={'orderDetails.reorder'}
                                defaultMessage={'Reorder this order'}
                            />
                        </Button>
                    </div>
                )}
            </h2>
            <div ref={contentRef}>
                <OrderDetail orderId={orderId} isDeliveryTracking={isDeliveryTracking} setIsDeliveryTracking={setIsDeliveryTracking} />
            </div>
            {reorderLoading && (<div className={classes.loadingAccountMain}><LoadingIndicator></LoadingIndicator></div>)}
        </MyAccountLayout>
    );
};

export default OrderDetailPage;
