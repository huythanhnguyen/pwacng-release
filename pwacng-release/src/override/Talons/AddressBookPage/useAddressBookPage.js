import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import defaultOperations from './addressBookPage.gql';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/AddressBook/addressBook.gql';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {useLocation} from "react-router-dom";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 *  A talon to support the functionality of the Address Book page.
 *
 *  @function
 *
 *  @param {Object} props
 *  @param {Object} props.operations - GraphQL operations to be run by the talon.
 *
 *  @returns {AddressBookPageTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useAddressBookPage } from '@magento/peregrine/lib/talons/AddressBookPage/useAddressBookPage';
 */
const PAGE_SIZE = 4;

export const useAddressBookPage = (props = {}) => {
    const { currentPage } = props;
    const operations = mergeOperations(defaultOperations, DEFAULT_OPERATIONS, props.operations);
    const {
        createCustomerAddressMutation,
        deleteCustomerAddressMutation,
        getCustomerAddressesForAddressBookQuery,
        getCustomerAddressesQuery,
        updateCustomerAddressMutation
    } = operations;
    const storage = new BrowserPersistence();
    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const addNew = query.get('add');

    const [
        ,
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();
    const [{ isSignedIn, currentUser }] = useUserContext();
    const [, { addToast }] = useToasts();

    const [, { dispatch }] = useEventingContext();

    const { data: customerAddressesData, loading, error } = useQuery(
        getCustomerAddressesForAddressBookQuery,
        {
            variables: {
                currentPage: currentPage,
                pageSize: PAGE_SIZE
            },
            fetchPolicy: 'cache-and-network',
            skip: !isSignedIn
        }
    );

    useEffect(() => {
        if (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [error]);

    const [
        deleteCustomerAddress,
        { loading: isDeletingCustomerAddress }
    ] = useMutation(deleteCustomerAddressMutation);

    const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState();

    const isRefetching = !!customerAddressesData && loading;
    const customerAddresses =
        (customerAddressesData &&
            customerAddressesData.customer &&
            customerAddressesData.customer.addressesV2.addresses) ||
        [];
    const totalPages =
        (customerAddressesData &&
            customerAddressesData.customer &&
            customerAddressesData.customer.addressesV2.total_pages) || 0;
    const totalCount =
        (customerAddressesData &&
            customerAddressesData.customer &&
            customerAddressesData.customer.addressesV2.total_count) || 0;

    const [
        createCustomerAddress,
        {
            error: createCustomerAddressError,
            loading: isCreatingCustomerAddress
        }
    ] = useMutation(createCustomerAddressMutation);
    const [
        updateCustomerAddress,
        {
            error: updateCustomerAddressError,
            loading: isUpdatingCustomerAddress
        }
    ] = useMutation(updateCustomerAddressMutation);

    const [isDialogOpen, setIsDialogOpen] = useState(addNew === 'true' || false);
    const [isDialogEditMode, setIsDialogEditMode] = useState(false);
    const [formAddress, setFormAddress] = useState({});

    // Use local state to determine whether to display errors or not.
    // Could be replaced by a "reset mutation" function from apollo client.
    // https://github.com/apollographql/apollo-feature-requests/issues/170
    const [displayError, setDisplayError] = useState(false);

    // Update the page indicator if the GraphQL query is in flight.
    useEffect(() => {
        setPageLoading(isRefetching);
    }, [isRefetching, setPageLoading]);

    const handleAddAddress = useCallback(() => {
        // Hide all previous errors when we open the dialog.
        setDisplayError(false);

        setIsDialogEditMode(false);
        setIsDialogOpen(true);
    }, []);

    const handleDeleteAddress = useCallback(addressId => {
        setConfirmDeleteAddressId(addressId);
    }, []);

    const handleCancelDeleteAddress = useCallback(() => {
        setConfirmDeleteAddressId(null);
    }, []);

    const handleConfirmDeleteAddress = useCallback(async () => {
        try {
            await deleteCustomerAddress({
                variables: { addressId: confirmDeleteAddressId },
                refetchQueries: [{
                    query: getCustomerAddressesForAddressBookQuery,
                    variables: {
                        currentPage: currentPage,
                        pageSize: PAGE_SIZE
                    }
                }, {
                    query: getCustomerAddressesQuery
                }],
                awaitRefetchQueries: true
            });

            dispatch({
                type: 'USER_ADDRESS_DELETE',
                payload: {
                    addressId: confirmDeleteAddressId,
                    user: currentUser
                }
            });

            setConfirmDeleteAddressId(null);
        } catch {
            return;
        }
    }, [
        totalPages,
        totalCount,
        confirmDeleteAddressId,
        deleteCustomerAddress,
        getCustomerAddressesForAddressBookQuery,
        dispatch,
        currentUser
    ]);

    const handleEditAddress = useCallback(address => {
        // Hide all previous errors when we open the dialog.
        setDisplayError(false);

        setIsDialogEditMode(true);
        setFormAddress(address);
        setIsDialogOpen(true);
    }, []);

    const handleCancelDialog = useCallback(() => {
        setIsDialogOpen(false);
    }, []);

    const handleConfirmDialog = useCallback(
        async formValues => {
            if (isDialogEditMode) {
                try {
                    const address = {
                        firstname: formValues.firstname,
                        telephone: formValues.telephone,
                        default_shipping: formValues.default_shipping || false,
                        default_billing: formValues.default_shipping || false,
                        country_code: 'VN',
                        city: formValues.city_code,
                        postcode: '00000',
                        street: formValues.street.filter(e => e),
                        custom_attributes: [
                            {
                                attribute_code: "city_code",
                                value: formValues.city_code
                            },
                            {
                                attribute_code: "ward_code",
                                value: formValues.ward_code
                            }
                        ]
                    };

                    await updateCustomerAddress({
                        variables: {
                            addressId: formAddress.id,
                            updated_address: address
                        },
                        refetchQueries: [{
                            query: getCustomerAddressesForAddressBookQuery,
                            variables: {
                                currentPage: currentPage,
                                pageSize: PAGE_SIZE
                            }
                        }],
                        awaitRefetchQueries: true
                    });

                    dispatch({
                        type: 'USER_ADDRESS_EDIT',
                        payload: {
                            id: formAddress.id,
                            address: address,
                            user: currentUser
                        }
                    });

                    if (formValues.default_shipping) {
                        storage.setItem('isAddressChanged', false);
                    }

                    setIsDialogOpen(false);
                } catch {
                    // Make sure any errors from the mutations are displayed.
                    setDisplayError(true);

                    // we have an onError link that logs errors, and FormError
                    // already renders this error, so just return to avoid
                    // triggering the success callback
                    return;
                }
            } else {
                try {
                    const address = {
                        firstname: formValues.firstname,
                        telephone: formValues.telephone,
                        default_shipping: formValues.default_shipping || false,
                        default_billing: formValues.default_shipping || false,
                        country_code: 'VN',
                        city: formValues.city_code,
                        postcode: '00000',
                        street: formValues.street.filter(e => e),
                        custom_attributes: [
                            {
                                attribute_code: "city_code",
                                value: formValues.city_code
                            },
                            {
                                attribute_code: "ward_code",
                                value: formValues.ward_code
                            }
                        ]
                    };
                    await createCustomerAddress({
                        variables: {
                            address
                        },
                        refetchQueries: [{
                            query: getCustomerAddressesForAddressBookQuery,
                            variables: {
                                currentPage: currentPage,
                                pageSize: PAGE_SIZE
                            }
                        }],
                        awaitRefetchQueries: true
                    });

                    dispatch({
                        type: 'USER_ADDRESS_CREATE',
                        payload: {
                            address,
                            user: currentUser
                        }
                    });

                    if (formValues.default_shipping) {
                        storage.setItem('isAddressChanged', false);
                    }
                    setIsDialogOpen(false);
                } catch {
                    // Make sure any errors from the mutations are displayed.
                    setDisplayError(true);

                    // we have an onError link that logs errors, and FormError
                    // already renders this error, so just return to avoid
                    // triggering the success callback
                    return;
                }
            }
        },
        [
            totalPages,
            totalCount,
            createCustomerAddress,
            formAddress,
            getCustomerAddressesForAddressBookQuery,
            isDialogEditMode,
            updateCustomerAddress,
            dispatch,
            currentUser
        ]
    );

    const formErrors = useMemo(() => {
        if (displayError) {
            return new Map([
                ['createCustomerAddressMutation', createCustomerAddressError],
                ['updateCustomerAddressMutation', updateCustomerAddressError]
            ]);
        } else return new Map();
    }, [createCustomerAddressError, displayError, updateCustomerAddressError]);

    // use data from backend until Intl.DisplayNames is widely supported
    const countryDisplayNameMap = useMemo(() => {
        const countryMap = new Map();

        if (customerAddressesData) {
            const { countries } = customerAddressesData;
            countries.forEach(country => {
                countryMap.set(country.id, country.full_name_locale);
            });
        }

        return countryMap;
    }, [customerAddressesData]);

    const isDialogBusy = isCreatingCustomerAddress || isUpdatingCustomerAddress;
    const isLoadingWithoutData = !customerAddressesData && loading;

    const formProps = {
        initialValues: formAddress
    };

    return {
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
        isLoading: loading
    };
};

/**
 * Object type returned by the {@link useAddressBookPage} talon.
 * It provides props data to use when rendering the address book page component.
 *
 * @typedef {Object} AddressBookPageTalonProps
 *
 * @property {String} confirmDeleteAddressId - The id of the address that is waiting to be confirmed for deletion.
 * @property {Map} countryDisplayNameMap - A Map of country id to its localized display name.
 * @property {Array<Object>} customerAddresses - A list of customer addresses.
 * @property {Map} formErrors - A Map of form errors.
 * @property {Object} formProps - Properties to pass to the add/edit form.
 * @property {Function} handleAddAdddress - Function to invoke when adding a new address.
 * @property {Function} handleCancelDeleteAddress - Function to deny the confirmation of deleting an address.
 * @property {Function} handleCancelDialog - Function to invoke when cancelling the add/edit dialog.
 * @property {Function} handleConfirmDeleteAddress - Function to invoke to accept the confirmation of deleting an address.
 * @property {Function} handleConfirmDialog - Function to invoke when submitting the add/edit dialog.
 * @property {Function} handleDeleteAddress - Function to invoke to begin the address deletion process.
 * @property {Function} handleEditAddress - Function to invoke when editing an existing address.
 * @property {Boolean} isDeletingCustomerAddress - Whether an address deletion is currently in progress.
 * @property {Boolean} isDialogBusy - Whether actions inside the dialog should be disabled.
 * @property {Boolean} isDialogEditMode - Whether the dialog is in edit mode (true) or add new mode (false).
 * @property {Boolean} isDialogOpen - Whether the dialog should be open.
 * @property {Boolean} isLoading - Whether the page is loading.
 */
