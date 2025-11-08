import React, {useEffect} from 'react';
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/MyAccount/Dashboard/extendStyle/dashboardContent.module.scss';
import { FormattedMessage } from 'react-intl';
import {Link} from "react-router-dom";
import DashboardContentOperations from './dashboardContent.gql';
import {useDashboardContent} from "./useDashboardContent";
import {Message} from "@magento/venia-ui/lib/components/Field";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import RecentOrders from "./recentOrders";
import {useToasts} from "@magento/peregrine";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const DashboardContent = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const [, { addToast }] = useToasts();

    const talonProps = useDashboardContent({
        ...DashboardContentOperations
    });

    const {
        initialValues,
        loadDataError
    } = talonProps;

    useEffect(() => {
        if (loadDataError) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: loadDataError.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [loadDataError])

    if (loadDataError) {
        return (
            <>
                <Message>
                    <FormattedMessage
                        id={'accountInformationPage.errorTryAgain'}
                        defaultMessage={
                            'Something went wrong. Please refresh and try again.'
                        }
                    />
                </Message>
            </>
        );
    }

    if (!initialValues) return <LoadingIndicator />;

    const { customer } = initialValues;
    const customerName = customer.firstname;
    const customerPhone = customer.custom_attributes.find(attr => attr.code === 'company_user_phone_number');
    const orders = customer.orders?.items ? customer.orders.items : [];

    const defaultAddress = customer.addressesV2.addresses.find(attr => attr.default_shipping === true);
    const streetRows = defaultAddress?.street ? defaultAddress.street.map((row) => row).join(', ') : '';
    const district = defaultAddress?.custom_attributes?.find(attr => attr.attribute_code === 'district')?.value || '';
    const ward = defaultAddress?.custom_attributes?.find(attr => attr.attribute_code === 'ward')?.value || '';
    const city = defaultAddress?.city || '';
    const additionalAddressString = `${ward !== '' ? ', ' + ward : ''}${!defaultAddress?.is_new_administrative ? `, ${district}` : ''}${city !== '' ? ', ' + city : ''}`;
    const defaultAddressString = defaultAddress ? `${streetRows}${additionalAddressString}` : '';

    return (
        <div className={classes.root}>
            <div className={classes.accountSummary}>
                <div className={`${classes.accountSummaryBox} ${classes.customerInformation}`}>
                    <div className={classes.boxInner}>
                        <p className={classes.name}>{customerName}</p>
                        <p className={classes.phone}>
                                    <span className={classes.label}>
                                        <FormattedMessage
                                            id={'global.phone'}
                                            defaultMessage={'Phone'}
                                        />
                                    </span>
                            <span className={classes.value}>{customerPhone ? customerPhone.value : ''}</span>
                        </p>
                        <p className={classes.email}>
                                    <span className={classes.label}>
                                        <FormattedMessage
                                            id={'global.email'}
                                            defaultMessage={'Email'}
                                        />
                                    </span>
                            <span className={classes.value}>{customer.email}</span>
                        </p>
                    </div>
                    <div className={classes.boxActions}>
                        <Link to={'/account-information'}>
                            <FormattedMessage
                                id={'global.update'}
                                defaultMessage={'Update'}
                            />
                        </Link>
                    </div>
                </div>
                <div className={`${classes.accountSummaryBox} ${classes.defaultAddress}`}>
                    <div className={classes.boxInner}>
                        <p className={classes.title}>
                                    <span>
                                        <FormattedMessage
                                            id={'global.shippingAddress'}
                                            defaultMessage={'Shipping Address'}
                                        />
                                    </span>
                            <span className={classes.defaultLabel}>
                                        <FormattedMessage
                                            id={'global.default'}
                                            defaultMessage={'Default'}
                                        />
                                    </span>
                        </p>
                        {
                            defaultAddressString ? (
                                <p className={classes.address}>
                                            <span className={classes.label}>
                                                <FormattedMessage
                                                    id={'global.address'}
                                                    defaultMessage={'Address'}
                                                />
                                            </span>
                                    <span className={classes.value}>
                                                {defaultAddressString}
                                            </span>
                                </p>
                            ) : (
                                <p className={classes.noDefaultAddress}>
                                            <span className={classes.label}>
                                                <FormattedMessage
                                                    id={'global.noDefaultAddress'}
                                                    defaultMessage={'You have not set up a default shipping address.'}
                                                />
                                            </span>
                                </p>
                            )
                        }
                    </div>
                    <div className={classes.boxActions}>
                        <Link to={'/address-book'}>
                            <FormattedMessage
                                id={'global.edit'}
                                defaultMessage={'Edit'}
                            />
                        </Link>
                    </div>
                </div>
                <div className={`${classes.accountSummaryBox} ${classes.totalOrders}`}>
                    <div className={classes.boxInner}>
                        <span className={classes.ordersIcon}></span>
                        <p className={classes.ordersSummary}>
                                    <span className={classes.label}>
                                        <FormattedMessage
                                            id={'dashboardContent.totalOrders'}
                                            defaultMessage={'Total your orders'}
                                        />
                                    </span>
                            <span className={classes.value}>
                                        {customer.orders.total_count + ' '}
                                {customer.orders.total_count > 1 ? (
                                    <FormattedMessage
                                        id={'dashboardContent.order'}
                                        defaultMessage={'orders'}
                                    />
                                ) : (
                                    <FormattedMessage
                                        id={'dashboardContent.order'}
                                        defaultMessage={'order'}
                                    />
                                )}
                                    </span>
                        </p>
                    </div>
                </div>
                <div className={`${classes.accountSummaryBox} ${classes.totalPoints}`}>
                    <div className={classes.boxInner}>
                        <span className={classes.pointsIcon}></span>
                        <p className={classes.ordersSummary}>
                                    <span className={classes.label}>
                                        <FormattedMessage
                                            id={'dashboardContent.totalPoints'}
                                            defaultMessage={'Accumulated points revenue'}
                                        />
                                    </span>
                            <span className={classes.value}>
                                        {customer?.loyalty_points || 0}
                                {' '}
                                {
                                    customer?.loyalty_points && customer?.loyalty_points > 1 ? (
                                        <FormattedMessage
                                            id={'dashboardContent.point'}
                                            defaultMessage={'points'}
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id={'dashboardContent.point'}
                                            defaultMessage={'point'}
                                        />
                                    )
                                }
                                    </span>
                        </p>
                    </div>
                </div>
            </div>
            {
                orders.length > 0 && (
                    <RecentOrders orders={orders}/>
                )
            }
        </div>
    )
};

export default DashboardContent;
