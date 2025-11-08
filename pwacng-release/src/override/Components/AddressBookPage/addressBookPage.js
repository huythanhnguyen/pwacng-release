import React, {useEffect, useMemo, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from 'react-feather';

import { useAddressBookPage } from '../../Talons/AddressBookPage/useAddressBookPage';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import Icon from '@magento/venia-ui/lib/components/Icon';
import LinkButton from '@magento/venia-ui/lib/components/LinkButton';
import LoadingIndicator, { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';

import AddressCard from './addressCard';
import AddEditDialog from '@magento/venia-ui/lib/components/AddressBookPage/addEditDialog';
import defaultClasses from '@magenest/theme/BaseComponents/AddressBookPage/extendStyle/addressBookPage.module.scss';
import accountClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/account.module.scss';
import MyAccountLayout from "../MyAccount/myAccountLayout";
import Button from "@magento/venia-ui/lib/components/Button";

const AddressBookPage = props => {
    const [currentPage, setCurrentPage] = useState(1);

    const talonProps = useAddressBookPage({ currentPage });
    const {
        confirmDeleteAddressId,
        countryDisplayNameMap,
        customerAddresses,
        totalPages,
        totalCount,
        formErrors,
        formProps,
        handleAddAddress,
        handleCancelDeleteAddress,
        handleCancelDialog,
        handleConfirmDeleteAddress,
        handleConfirmDialog,
        handleDeleteAddress,
        handleEditAddress,
        isDeletingCustomerAddress,
        isDialogBusy,
        isDialogEditMode,
        isDialogOpen,
        isLoading
    } = talonProps;

    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, accountClasses, props.classes);
    const [isOpenSidebar, setIsOpenSidebar] = useState(false);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0 && !isLoading) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages, isLoading]);

    const PAGE_TITLE = formatMessage({
        id: 'global.addressBook',
        defaultMessage: 'My address'
    });
    const addressBookElements = useMemo(() => {
        const defaultToBeginning = (address1, address2) => {
            if (address1.default_shipping) return -1;
            if (address2.default_shipping) return 1;
            return 0;
        };

        return Array.from(customerAddresses)
            .sort(defaultToBeginning)
            .map(addressEntry => {
                const countryName = countryDisplayNameMap.get(
                    addressEntry.country_code
                );

                const boundEdit = () => handleEditAddress(addressEntry);
                const boundDelete = () => handleDeleteAddress(addressEntry.id);
                const isConfirmingDelete =
                    confirmDeleteAddressId === addressEntry.id;

                return (
                    <AddressCard
                        address={addressEntry}
                        countryName={countryName}
                        isConfirmingDelete={isConfirmingDelete}
                        isDeletingCustomerAddress={isDeletingCustomerAddress}
                        key={addressEntry.id}
                        onCancelDelete={handleCancelDeleteAddress}
                        onConfirmDelete={handleConfirmDeleteAddress}
                        onDelete={boundDelete}
                        onEdit={boundEdit}
                    />
                );
            });
    }, [
        confirmDeleteAddressId,
        countryDisplayNameMap,
        customerAddresses,
        totalPages,
        totalCount,
        handleCancelDeleteAddress,
        handleConfirmDeleteAddress,
        handleDeleteAddress,
        handleEditAddress,
        isDeletingCustomerAddress
    ]);

    const pagesToShow = useMemo(() => {
        const pages = [];
        const startPage = Math.max(1, currentPage - 1); // Bắt đầu từ 2 trang trước trang hiện tại
        const endPage = Math.min(totalPages - 1, currentPage + 1); // Kết thúc với 2 trang sau trang hiện tại

        if (currentPage === 1) {
            pages.push(1);
            if (totalPages > 2) pages.push(2);
            if (totalPages > 3) pages.push(3);
        }
        else if (currentPage === totalPages || currentPage === (totalPages - 1)) {
            if (totalPages > 3) pages.push(totalPages - 3);
            if (totalPages > 2) pages.push(totalPages - 2);
            if (totalPages > 1) pages.push(totalPages - 1);
        }
        else {
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    const paginationControls = useMemo(() => {
        return (
            <div className={classes.pagination}>
                <button className={classes.firstPage} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <Icon className={(currentPage === 1) ? classes.icon_disabled : classes.icon} size={20} src={ChevronLeftIcon} />
                </button>
                {pagesToShow.map(page => (
                    <button
                        key={page}
                        className={currentPage === page ? classes.activePage : ''}
                        onClick={() => handlePageChange(page)}
                    >
                        <span>{page}</span>
                    </button>
                ))}
                <button className={classes.lastPage} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    <Icon className={(currentPage === totalPages) ? classes.icon_disabled : classes.icon} size={20} src={ChevronRightIcon} />
                </button>
            </div>
        );
    }, [currentPage, totalPages, pagesToShow]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const addressBookPageMessage = formatMessage(
        {
            id: 'addressBookPage.addAddressMessage',
            defaultMessage:
                'You have added {count} address in your address book.'
        },
        { count: customerAddresses.length }
    );

    return (
        <MyAccountLayout currentPage={'addressBook'} isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar}>
            <h2 className={classes.currentPageTitle}>
                <button className={classes.backButton} onClick={() => setIsOpenSidebar(true)}>
                    <span>{'<'}</span>
                </button>
                <span>
                    {PAGE_TITLE}
                </span>
                <div className={classes.actions}>
                    <Button
                        type="button" priority="high"
                        key="addAddressButton"
                        onClick={handleAddAddress}
                        data-cy="AddressBookPage-addButton"
                    >
                        <span className={classes.addText}>
                            <FormattedMessage
                                id={'addressBookPage.addAddressText'}
                                defaultMessage={'Add an Address'}
                            />
                        </span>
                    </Button>
                </div>
            </h2>
            <StoreTitle>{PAGE_TITLE}</StoreTitle>
            {isLoading ? <LoadingIndicator/> : (
                <>
                    {totalPages > 0 ? (
                        <div className={classes.addressBookWrapper}>
                            {addressBookElements}
                            {paginationControls}
                        </div>
                    ) : (
                        <div className={classes.emptyAddressMessage}>
                            <FormattedMessage
                                id={'addressBookPage.noAddressMessage'}
                                defaultMessage={'You have not saved any addresses.'}
                            />
                        </div>
                    )}
                </>
            )}
            <AddEditDialog
                formErrors={formErrors}
                formProps={formProps}
                isBusy={isDialogBusy || false}
                isEditMode={isDialogEditMode}
                isOpen={isDialogOpen}
                onCancel={handleCancelDialog}
                onConfirm={handleConfirmDialog}
            />
        </MyAccountLayout>
    );
};

export default AddressBookPage;
