import React, {useState, useCallback} from 'react';
import defaultClasses from './storeFilter.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";

import {Form} from "informed";
import Button from "@magento/venia-ui/lib/components/Button";
import FormErrors from "@magento/venia-ui/lib/components/FormError";
import SourceType from "./sourceType";
import City from "./city";
import Ward from "@magenest/theme/BaseComponents/Ward";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";

const StoreFilter = props => {
    const {
        storeSourceDefault,
        setStoreSource,
        setStoreCity,
        setStoreWard
    } = props;

    const classes = useStyle(defaultClasses, props.classes);

    const [ storeLocationValue, setStoreLocationValue ] = useState({
        sourceType: storeSourceDefault,
        city: '',
        ward: ''
    });
    const [ cityKey, setCityKey ] = useState(0);
    const [ wardKey, setWardKey ] = useState(0);

    const handleSubmit = useCallback(
        async formValues => {
            // eslint-disable-next-line no-unused-vars
            const { store_source, store_city, store_ward } = formValues;
            setStoreSource(store_source);
            setStoreCity(store_city);
            setStoreWard(store_ward);
        }, [setStoreSource,
            setStoreCity,
            setStoreWard]
    );

    return (
        <Form className={classes.form} onSubmit={handleSubmit}>
            <div className={classes.fields}>
                <SourceType
                    field={'store_source'}
                    data-cy="store_source"
                    address={storeLocationValue}
                    setAddress={setStoreLocationValue}
                    initialValue={storeLocationValue.sourceType}
                    setCityKey={setCityKey}
                    setWardKey={setWardKey}
                />
                <City
                    field={'store_city'}
                    data-cy="store_city"
                    setAddress={setStoreLocationValue}
                    address={storeLocationValue}
                    initialValue={storeLocationValue.city}
                    cityKey={cityKey}
                    setWardKey={setWardKey}
                />
                <Ward
                    field={'store_ward'}
                    data-cy="store_ward"
                    address={storeLocationValue}
                    setAddress={setStoreLocationValue}
                    initialValue={storeLocationValue.ward}
                    wardKey={wardKey}
                />
            </div>
            <div className={classes.buttonContainer}>
                <Button
                    type="submit"
                    priority="high"
                >
                    <FormattedMessage
                        id="storeFilter.submit"
                        defaultMessage="Show"
                    />
                </Button>
            </div>
        </Form>
    )
}

export default StoreFilter;
