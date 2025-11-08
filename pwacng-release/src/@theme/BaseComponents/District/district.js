import {useIntl} from "react-intl";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "../City/city.module.scss";
import Field from "@magento/venia-ui/lib/components/Field";
import Select from "@magento/venia-ui/lib/components/Select";
import React from "react";
import useDistrict from "../../Talons/District/useDistrict";
import TextInput from "@magento/venia-ui/lib/components/TextInput";

const District = props => {
    const { formatMessage } = useIntl();

    const {
        field,
        label,
        translationId,
        address,
        setAddress,
        setAddressLabel,
        addressLabel,
        optional,
        districtKey,
        ...selectProps
    } = props

    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useDistrict({
        address,
        setAddress,
        setAddressLabel,
        addressLabel
    });

    const {
        districts,
        loading,
        handleChange
    } = talonProps;

    const districtProps = {
        classes,
        disabled: loading,
        field,
        items: districts ? districts : [],
        ...selectProps
    };

    const district = loading ? (
            <TextInput
                field={field}
                placeholder={formatMessage({
                    id: 'global.district',
                    defaultMessage: 'District'
                })}
            />
        ) : (
            <Select
                {...districtProps}
                key={districtKey}
                id={classes.root}
                onChange={(e) => handleChange(e)}
                isEmpty={!address?.district}
                initialValue={address?.district || ''}
            />
        );


    return (
        <Field
            id={field}
            label={formatMessage({
                id: 'global.district',
                defaultMessage: 'District'
            })}
            optional={optional}
        >
            {district}
        </Field>
    )
}

export default District
