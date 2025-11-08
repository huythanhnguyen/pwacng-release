import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "../TextInput/textInput";
import Trigger from "@magento/venia-ui/lib/components/Trigger";
import Icon from "@magento/venia-ui/lib/components/Icon";
import React from "react";
import {useIntl} from "react-intl";
import { XCircle } from 'react-feather';
import {useFormApi} from "informed";
import {hasLengthAtLeast, hasLengthAtMost, isRequired, validatePassword} from "../../Util/formValidators";
import combine from "@magento/venia-ui/lib/util/combineValidators";

const NoteField = props => {
    const { formatMessage } = useIntl();

    const formApi = useFormApi();

    const {
        classes,
        initialValue,
        commentMaxLength
    } = props

    return (
        <Field
            id="note"
            label={formatMessage({
                id: 'global.note:',
                defaultMessage: 'Note: '
            })}
            classes={{ root: classes.fieldInput }}
        >
            <TextInput
                id="note"
                field="note"
                mask={value => value && value.trim()}
                maskOnBlur={true}
                data-cy="note"
                validate={combine([
                    [hasLengthAtMost, commentMaxLength]
                ])}
                validateOnBlur
                after={<Trigger action={() => formApi.setValues({note: ''})}>
                    <Icon src={XCircle} size={16} />
                </Trigger>}
                classes={{after: classes.after, root: classes.fieldIconsRoot}}
                placeholder={formatMessage({
                    id: 'global.enterNote',
                    defaultMessage: 'Enter note'
                })}
                initialValue={initialValue}
            />
        </Field>
    )
}

export default NoteField
