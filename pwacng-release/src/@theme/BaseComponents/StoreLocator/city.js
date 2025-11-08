import React, {useCallback, useRef} from "react";
import useCity from "@magenest/theme/Talons/StoreLocator/useCity";
import Field from "@magento/venia-ui/lib/components/Field";
import Select from "@magento/venia-ui/lib/components/Select";
import {useStyle} from "@magento/venia-ui/lib/classify";
import {useIntl} from "react-intl";
import defaultClasses from "@magenest/theme/BaseComponents/City/city.module.scss";
import UiSelect from "react-select";

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

const City = props => {
    const { formatMessage } = useIntl();
    const { lock, unlock } = useScrollRestore();

    const {
        field,
        label,
        translationId,
        address,
        setAddress,
        setAddressLabel,
        addressLabel,
        optional,
        cityKey,
        setWardKey,
        ...selectProps
    } = props

    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useCity({
        address,
        setAddress,
        setAddressLabel,
        addressLabel,
        setWardKey
    });

    const {
        cities,
        loading,
        handleChange
    } = talonProps;

    const cityProps = {
        classes,
        disabled: loading,
        field,
        items: cities || [],
        options: cities || [],
        ...selectProps
    };

    return (
        <Field
            id={field}
            label={formatMessage({
                id: 'global.city',
                defaultMessage: 'City'
            })}
            optional={optional}
        >
            <div className={classes.cityField}>
                <Select
                    key={`${cityKey}_${address?.city}`}
                    {...cityProps}
                    autoComplete='off'
                    readOnly={true}
                    id={classes.root}
                    isEmpty={!address?.city}
                    initialValue={address?.city || ''}
                    classes={classes}
                />
                <div className={classes.uiSelectField}>
                    <UiSelect
                        key={`${cityKey}_${address?.city}_uiSelect`}
                        classNamePrefix={'uiSelect'}
                        {...cityProps}
                        autoComplete='off'
                        id={classes.root}
                        onChange={(e) => handleChange(e)}
                        isEmpty={!address?.city}
                        value={address?.city ? (cities ? cities : []).find(opt => opt.value === address.city) : null}
                        placeholder={formatMessage({
                            id: 'global.city',
                            defaultMessage: 'City'
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
        </Field>
    )
}

export default City
