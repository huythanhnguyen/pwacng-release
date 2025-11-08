import React from 'react';
import defaultClasses from './contact.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import StaticBreadcrumbs from "../../../override/Components/Breadcrumbs/staticBreadcrumbs";
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";
import {FormattedMessage, useIntl} from "react-intl";
import ContactForm from "./contactForm";

const Contact = () => {
    const classes = useStyle(defaultClasses);
    const { formatMessage } = useIntl();

    return (
        <>
            <StaticBreadcrumbs pageTitle={
                formatMessage(
                    {
                        id: "global.contact",
                        defaultMessage: 'Contact'
                    }
                )
            } />
            <div className={classes.root}>
                <div className={classes.pageTitle}>
                    <h1>
                        <FormattedMessage
                            id={'global.contact'}
                            defaultMessage={'Contact'}
                        />
                    </h1>
                </div>
                <div className={classes.contactWrapper}>
                    <div className={classes.contactForm}>
                        <ContactForm/>
                    </div>
                    <div className={classes.contactInformation}>
                        <CmsBlock identifiers={'contact-us-sidebar'} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Contact;
