import React from "react";
import useSourceType from "@magenest/theme/Talons/StoreLocator/useSourceType";
import Field from "@magento/venia-ui/lib/components/Field";
import Select from "@magento/venia-ui/lib/components/Select";
import {useStyle} from "@magento/venia-ui/lib/classify";
import {useIntl} from "react-intl";

const SourceType = props => {
    const { formatMessage } = useIntl();

    const {
        field,
        label,
        translationId,
        address,
        setAddress,
        setAddressLabel,
        optional,
        setCityKey,
        setWardKey,
        ...selectProps
    } = props

    const classes = useStyle(props.classes);

    const talonProps = useSourceType({
        setAddress,
        setAddressLabel,
        setCityKey,
        setWardKey
    });

    const {
        sourceTypeData,
        loading,
        handleChange
    } = talonProps;

    const sourceTypeProps = {
        classes,
        disabled: loading,
        field,
        items: sourceTypeData || [],
        ...selectProps
    };

    return (
        <Field
            id={field}
            label={formatMessage({
                id: 'global.sourceType',
                defaultMessage: 'Region'
            })}
            optional={optional}
        >
            <Select
                {...sourceTypeProps}
                id={classes.root}
                onChange={(e) => handleChange(e)}
                isEmpty={!address?.sourceType}
            />
        </Field>
    )
}

export default SourceType
