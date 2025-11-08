import React, {useCallback, useRef, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "../City/city.module.scss";
import Field from "@magento/venia-ui/lib/components/Field";
import UiSelect from 'react-select';
import Select from "@magento/venia-ui/lib/components/Select";
import useWard from "../../Talons/Ward/useWard";
import TextInput from "@magento/venia-ui/lib/components/TextInput";

const useScrollRestore = () => {
    const yRef = useRef(0);
    const activeRef = useRef(false);
    const isSmall = () => window.matchMedia("(max-width: 640px)").matches;
    const lock = useCallback(() => {
        if (!isSmall()) return;
        yRef.current = window.scrollY;
        document.body.classList.add("ui-select-opened");
        activeRef.current = true;
    }, []);
    const unlock = useCallback(() => {
        if (!activeRef.current) return;
        window.scrollTo(0, yRef.current);
        setTimeout(() => {
            document.body.classList.remove("ui-select-opened");
            activeRef.current = false;
        }, 1);
    }, []);
    return { lock, unlock };
}

const Ward = props => {
    const { formatMessage } = useIntl();
    const { lock, unlock } = useScrollRestore();
    const [error, setError] = useState(false);

    const {
        field,
        label,
        translationId,
        address,
        setAddress,
        setAddressLabel,
        addressLabel,
        optional,
        wardKey,
        ...selectProps
    } = props

    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useWard({
        address,
        setAddress,
        setAddressLabel,
        addressLabel,
    });

    const {
        wards,
        loading,
        handleChange
    } = talonProps;

    const wardProps = {
        classes,
        disabled: loading,
        field,
        items: wards ? wards : null,
        options: wards ? wards : null,
        ...selectProps
    };

    const handleBlur = () => {
        if (!address?.ward) {
            setError(true);
        }
    };

    const ward = loading ? (
        <TextInput
            field={field}
            placeholder={formatMessage({
                id: 'global.ward',
                defaultMessage: 'Ward'
            })}
        />
    ) : (
        <div className={classes.cityField}>
            <Select
                key={`${wardKey}_${address?.ward}`}
                {...wardProps}
                autoComplete='off'
                readOnly={true}
                id={classes.root}
                isEmpty={!address?.ward}
                initialValue={address?.ward || ''}
            />
            <div className={classes.uiSelectField}>
                <UiSelect
                    {...wardProps}
                    autoComplete='off'
                    key={`${wardKey}_${address?.ward}_uiSelect`}
                    classNamePrefix={'uiSelect'}
                    id={classes.root}
                    onChange={(e) => {
                        const value = e.value;
                        if (typeof wardProps.onChange === 'function') {
                            wardProps.onChange({ target: { value } });
                        }
                        handleChange(e);
                    }}
                    isEmpty={!address?.ward}
                    value={address?.ward ? (wards ? wards : []).find(opt => opt.value === address.ward) : null}
                    placeholder={formatMessage({
                        id: 'global.ward',
                        defaultMessage: 'Ward'
                    })}
                    noOptionsMessage={() => formatMessage({
                        id: 'global.noOptions',
                        defaultMessage: 'No matching options found'
                    })}
                    isSearchable
                    menuPosition="fixed"
                    menuPlacement="bottom"
                    menuShouldScrollIntoView={false}
                    menuPortalTarget={document.body}
                    onMenuOpen={lock}
                    onMenuClose={unlock}
                    // tắt flip của Popper
                    popperProps={{
                        modifiers: [
                            {
                                name: 'flip',
                                enabled: false
                            }
                        ]
                    }}
                    styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                    }}
                    // menuIsOpen={true}
                />
            </div>
        </div>
    );

    return (
        <Field
            id={field}
            label={formatMessage({
                id: 'global.ward',
                defaultMessage: 'Ward'
            })}
            optional={optional}
        >
            {ward}
            {
                error && (
                    <p className={classes.message}>
                        <FormattedMessage
                            id={'validation.isRequired'}
                            defaultMessage={'Is required.'}
                        />
                    </p>
                )
            }
        </Field>
    )
}

export default Ward
