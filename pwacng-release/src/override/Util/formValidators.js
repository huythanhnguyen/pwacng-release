/**
 * @fileoverview This file houses functions that can be used for
 * validation of form fields.
 *
 * Note that these functions should return a string error message
 * when they fail, and `undefined` when they pass.
 */
import message from "@magento/venia-ui/lib/components/Field/message";

const SUCCESS = undefined;

export const hasLengthAtLeast = (value, values, minimumLength) => {
    const message = {
        id: 'validation.hasLengthAtLeast',
        defaultMessage: 'Must contain at least {value} character(s).',
        value: minimumLength
    };
    if (!value || value.length < minimumLength) {
        return message;
    }

    return SUCCESS;
};

export const hasLengthAtMost = (value, values, maximumLength) => {
    if (value && value.length > maximumLength) {
        const message = {
            id: 'validation.hasLengthAtMost',
            defaultMessage: 'Must not exceed {value} character(s).',
            value: maximumLength
        };
        return message;
    }

    return SUCCESS;
};

export const hasLengthExactly = (value, values, length) => {
    if (value && value.length !== length) {
        const message = {
            id: 'validation.hasLengthExactly',
            defaultMessage: 'Must contain exactly {value} character(s).',
            value: length
        };
        return message;
    }

    return SUCCESS;
};

/**
 * isRequired is provided here for convenience but it is inherently ambiguous and therefore we don't recommend using it.
 * Consider using more specific validators such as `hasLengthAtLeast` or `mustBeChecked`.
 */
export const isRequired = value => {
    const FAILURE = {
        id: 'validation.isRequired',
        defaultMessage: 'Is required.'
    };

    // The field must have a value (no null or undefined) and
    // if it's a boolean, it must be `true`.
    if (!value) return FAILURE;

    // If it is a number or string, it must have at least one character of input (after trim).
    const stringValue = String(value).trim();
    const measureResult = hasLengthAtLeast(stringValue, null, 1);

    if (measureResult) return FAILURE;
    return SUCCESS;
};

export const isConfirmPassword = (value, password) => {
    const FAILURE = {
        id: 'validation.isConfirmPassword',
        defaultMessage: 'Passwords do not match'
    };

    const passwordCurrent = password.newPassword || password.password;
    if (passwordCurrent !== password.confirm_password) {
        return FAILURE
    } else {
        return SUCCESS
    }
}

export const mustBeChecked = value => {
    const message = {
        id: 'validation.mustBeChecked',
        defaultMessage: 'Must be checked.'
    };
    if (!value) return message;

    return SUCCESS;
};

export const validateRegionCode = (value, values, countries) => {
    const countryCode = DEFAULT_COUNTRY_CODE;
    const country = countries.find(({ id }) => id === countryCode);

    if (!country) {
        const invalidCountry = {
            id: 'validation.invalidCountry',
            defaultMessage: 'Country "{value}" is not an available country.',
            value: countryCode
        };
        return invalidCountry;
    }
    const { available_regions: regions } = country;

    if (!(Array.isArray(regions) && regions.length)) {
        const invalidRegions = {
            id: 'validation.invalidRegions',
            defaultMessage:
                'Country "{value}" does not contain any available regions.',
            value: countryCode
        };
        return invalidRegions;
    }

    const region = regions.find(({ code }) => code === value);
    if (!region) {
        const invalidAbbrev = {
            id: 'validation.invalidAbbreviation',
            defaultMessage:
                'State "{value}" is not a valid state abbreviation.',
            value: value
        };
        return invalidAbbrev;
    }

    return SUCCESS;
};

export const validatePassword = value => {
    const count = {
        lower: 0,
        upper: 0,
        digit: 0,
    };

    for (const char of value) {
        if (/[a-z]/.test(char)) count.lower++;
        else if (/[A-Z]/.test(char)) count.upper++;
        else if (/\d/.test(char)) count.digit++;
    }

    if (Object.values(count).filter(Boolean).length < 3) {
        const message = {
            id: 'validation.validatePassword',
            defaultMessage:
                'Password must contain: lowercase letters, uppercase letters, numbers.'
        };
        return message;
    }

    return SUCCESS;
};

export const isEqualToField = (value, values, fieldKey) => {
    const message = {
        id: 'validation.isEqualToField',
        defaultMessage: '{value} must match.',
        value: fieldKey
    };
    return value === values[fieldKey] ? SUCCESS : message;
};

export const isNotEqualToField = (value, values, fieldKey) => {
    const message = {
        id: 'validation.isNotEqualToField',
        defaultMessage: '{value} must be different',
        value: fieldKey
    };
    return value !== values[fieldKey] ? SUCCESS : message;
};

export const isEmail = (value) => {
    const regex = String(value)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+(com|org|net|edu|gov|mil|int|info|biz|name|museum|[a-zA-Z]{2})))$/
        );
    if (!regex) {
        return {
            id: 'validation.validateEmail',
            defaultMessage:
                'Please enter a valid email address'
        };
    }

    return SUCCESS;
}

export const isName = (value) => {
    const regex = /^-+$/;

    if (regex.test(value)) {
        return {
            id: 'validation.validateName',
            defaultMessage:
                'The recipient\'s name is invalid.'
        };
    }

    return SUCCESS;
}

export const isPhoneNumber = (value) => {
    const regex = /^(84|0)(2[0-9]|3|4|5|7|8|9)([0-9]{8})$/;

    if (!regex.test(value)) {
        return {
            id: 'validation.validatePhone',
            defaultMessage:
                'Please fill in a valid phone number'
        };
    }

    return SUCCESS
}

export const isCustomerNo = (value) => {
    if (value) {
        // Kiểm tra giá trị phải là số và có độ dài 13 hoặc 16
        const regex = /^\d{13}$|^\d{16}$/;
        if (!regex.test(value)) {
            return {
                id: 'validation.isCustomerNo',
                defaultMessage: 'Please fill in a valid Mcard code or Customer code'
            };
        }
    }

    return SUCCESS;
};

export const isVatNumber = (value) => {
    if (value) {
        const trimmedValue = value.trim();
        // Chỉ cho phép ký tự số, chữ cái Latin và dấu gạch nối (-) với độ dài tối đa 20 ký tự
        const regex = /^[a-zA-Z0-9-]{1,20}$/;
        if (!regex.test(trimmedValue)) {
            return {
                id: 'validation.isVatNumber',
                defaultMessage: 'Please fill in a valid company tax code'
            };
        }
    }

    return SUCCESS;
};
