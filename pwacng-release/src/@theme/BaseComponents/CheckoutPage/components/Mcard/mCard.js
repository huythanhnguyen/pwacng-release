import React from 'react';
import mCardImage from "../../../../static/images/mCard.png";
import {FormattedMessage, useIntl} from "react-intl";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "../../../../../override/Components/TextInput/textInput";
import {Link} from "react-router-dom";
import defaultClasses from './mCard.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {Form, useFormApi} from "informed";
import useMCard from "../../../../Talons/MCard/useMCard";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";

const MCard = props => {
    const {
        customerNo
    } = props;

    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();

    const talonProps = useMCard({
        customerNo
    });

    const customerNoInit = storage.getItem('customer_no');

    const {
        handleBlur,
        handleSubmit,
        setFormApi
    } = talonProps;

    return (
        <Form onSubmit={handleSubmit} getApi={setFormApi}>
            <div className={classes.mCardWrapper}>
                <img src={mCardImage} alt={'mCard'} />
                <div className={classes.mCardDetails}>
                    <strong className={classes.mCardTitle}>
                        <FormattedMessage
                            id={'global.mCardTitle'}
                            defaultMessage={'Enter your Mcard membership code or customer code'}
                        />
                        <span>
                            (
                                <FormattedMessage
                                    id={'global.ifApplicable'}
                                    defaultMessage={'if applicable'}
                                />
                            )
                        </span>
                    </strong>
                    <Field
                        id={'mCard_code'}
                    >
                        <TextInput
                            field={'mCard_code'}
                            id={'mCard_code'}
                            placeholder={formatMessage({
                                id: 'global.mCardTitle',
                                defaultMessage: 'Enter your Mcard membership code or customer code'
                            })}
                            onBlur={e => handleBlur(e.target.value)}
                            initialValue={customerNoInit ? customerNoInit : ''}
                        />
                        <p className={classes.mCardNote}>
                            <FormattedMessage
                                id={'global.mCardNote'}
                                defaultMessage={'* Enter the 16-digit or 13-digit <highlight>MCard</highlight> code on your MCard app to accumulate points.'}
                                values={{
                                    highlight: chunks => (
                                        <strong className={classes.headingHighlight}>MCard</strong>
                                    ),
                                }}
                            />
                        </p>
                    </Field>
                </div>
            </div>
        </Form>
    )
}

export default MCard
