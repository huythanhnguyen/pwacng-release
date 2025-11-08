import defaultOperations from './deliveryTime.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useLazyQuery, useMutation, useQuery} from "@apollo/client";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {useIntl} from "react-intl";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {FormContext} from "../../Context/Checkout/formContext";

const UseDeliveryTime = props => {
    const {
        setDeliveryDate,
        deliveryDate,
        isExportVat,
        doneEditing,
        doneGuestSubmit,
        deliveryDateInformation,
        isDeliveryTimeInit,
        setIsDeliveryTimeInit
    } = props;
    const { formatMessage } = useIntl();
    const operations = mergeOperations(defaultOperations, props.operations);
    const [{cartId}] = useCartContext();
    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const { setIsNextStep } = useContext(FormContext);
    const [ fieldKey, setFieldKey ] = useState(0);

    const {
        getDeliveryDate,
        getDeliveryTime,
        getStoreConfigDelivery
    } = operations;

    const { data: deliveryDateData, loading: deliveryDateLoading, error: deliveryDateError } = useQuery(getDeliveryDate, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: storeConfigData } = useQuery(getStoreConfigDelivery, {
        fetchPolicy: 'cache-and-network'
    });

    const [fetchDeliveryTime,
        {
            data: deliveryTimeData,
            loading: deliveryTimeLoading,
            error: deliveryTimeError
        }] = useLazyQuery(getDeliveryTime, {
        fetchPolicy: 'cache-and-network'
    });

    const [formattedTimeData, setFormattedTimeData] = useState([
        {
            label: formatMessage({
                id: 'global.selectDeliveryHour',
                defaultMessage: 'Select delivery hour'
            }),
            value: ''
        }
    ]);

    useEffect(async () => {
        if (deliveryDate.date && deliveryDateData) {

            const scheduleIdSelected =
                deliveryDateData?.getDeliveryDateConfiguration[0]?.schedules.find(schedule => schedule.value === deliveryDate.date)?.schedule_id;

            const dateSelected =
                deliveryDateData?.getDeliveryDateConfiguration[0]?.schedules.find(schedule => schedule.value === deliveryDate.date)?.value;

            await fetchDeliveryTime({
                variables: {
                    scheduleId: scheduleIdSelected,
                    date: dateSelected
                }
            })
        }
    }, [deliveryDate.date, deliveryDateData])

    const handeChangeDate = useCallback(value => {
        setDeliveryDate({
            ...deliveryDate,
            date: value,
            time_interval_id: '',
            from: '',
            to: ''
        });
        formApiRef.current.setValue('time_interval_id', '');
    }, [deliveryDate]);

    useEffect(async () => {
        if (deliveryDateInformation && isDeliveryTimeInit && deliveryDateData) {
            const deliveryDateInit = deliveryDateData?.getDeliveryDateConfiguration[0]?.schedules.find(schedule => schedule.value === deliveryDateInformation.date);

            if (deliveryDateInit) {
                setIsDeliveryTimeInit(false);

                const result = await fetchDeliveryTime({
                    variables: {
                        scheduleId: deliveryDateInit.schedule_id,
                        date: deliveryDateInit.value
                    }
                })

                const deliveryTimeInit = result?.data?.getTimeInterval.find(time => time.time_interval_id === deliveryDateInformation.time_interval_id)

                if (deliveryTimeInit && deliveryDateInit) {
                    setDeliveryDate({
                        ...deliveryDateInformation
                    })
                } else if (deliveryDateInit && !deliveryTimeInit) {
                    setDeliveryDate({
                        ...deliveryDateInformation,
                        date: deliveryDateInit.value,
                        time_interval_id: '',
                        from: '',
                        to: ''
                    })
                } else {
                    setDeliveryDate({
                        ...deliveryDateInformation,
                        date: '',
                        time_interval_id: '',
                        from: '',
                        to: ''
                    })
                }

                setFieldKey(fieldKey + 1);
            }
        }
    }, [deliveryDateInformation, deliveryDateData, isDeliveryTimeInit]);

    const handeChangeTime = useCallback(value => {
        const from = deliveryTimeData?.getTimeInterval?.find(time => time.time_interval_id === Number(value))?.from || '';
        const to = deliveryTimeData?.getTimeInterval?.find(time => time.time_interval_id === Number(value))?.to || '';

        setDeliveryDate({
            ...deliveryDate,
            time_interval_id: Number(value),
            from,
            to
        })
    }, [deliveryDate, deliveryTimeData]);

    const handleChangeNote = useCallback(value => {
        setDeliveryDate({
            ...deliveryDate,
            comment: value
        })
    }, [deliveryDate]);

    let formattedDateData = [{ label: formatMessage({
            id: 'global.selectDeliveryDate',
            defaultMessage: 'Select delivery date'
        }), value: '' }];

    if (!deliveryDateLoading && !deliveryDateError && deliveryDateData) {
        const { schedules } = deliveryDateData?.getDeliveryDateConfiguration[0] || {schedules: []};

        formattedDateData = [
            {

                value: '',
                label: formatMessage({
                    id: 'global.selectDeliveryDate',
                    defaultMessage: 'Select delivery date'
                }),
                schedule_id: ''
            },
            ...schedules
        ]
    }

    useEffect(() => {
        if (!deliveryDate.date) {
            setFormattedTimeData([
                {
                    label: formatMessage({
                        id: 'global.selectDeliveryHour',
                        defaultMessage: 'Select delivery hour'
                    }),
                    value: ''
                }
            ]);
        } else {
            if (!deliveryTimeLoading && !deliveryTimeError && deliveryTimeData) {
                const { getTimeInterval } = deliveryTimeData;

                const updatedTimeDelivery = [
                    {

                        value: '',
                        label: formatMessage({
                            id: 'global.selectDeliveryHour',
                            defaultMessage: 'Select delivery hour'
                        }),
                        time_interval_id: '',
                        from: '',
                        to: ''
                    },
                    ...getTimeInterval
                ];

                const formatted = updatedTimeDelivery.map(time => {
                    if (time.from && time.to) {
                        const timeFrom = `${time.from / 60}:00`;
                        const timeTo = `${time.to / 60}:00`;

                        return {
                            label: `${timeFrom} - ${timeTo}`,
                            value: time.time_interval_id
                        }
                    } else {
                        return time
                    }
                })

                setFormattedTimeData(formatted);
            }
        }
    }, [deliveryTimeLoading, deliveryTimeError, deliveryTimeData, deliveryDate.date]);

    useEffect(() => {
        if(!isExportVat) {
            if (deliveryDate.date && !!deliveryDate.time_interval_id && (doneEditing || doneGuestSubmit)) {
                setIsNextStep(true)
            } else {
                setIsNextStep(false)
            }
        }
    }, [isExportVat, setIsNextStep, deliveryDate, doneEditing, doneGuestSubmit]);

    const handleSubmit = useCallback(async values => {
        try {
            const errors = formApiRef.current.getState().errors;

            const {
                date,
                time_interval_id
            } = values;

            if (Object.keys(errors).length === 0) {
                if (!(date && time_interval_id)) {
                    setIsNextStep(false);
                }
            } else {
                setIsNextStep(false);
            }
        } catch (error) {
            console.error(error)
        }
    }, [setIsNextStep, formApiRef, cartId]);

    return {
        handeChangeDate,
        handeChangeTime,
        handleChangeNote,
        dateData: formattedDateData,
        timeData: formattedTimeData,
        handleSubmit,
        setFormApi,
        fieldKey,
        commentMaxLength: 30
    }
}

export default UseDeliveryTime
