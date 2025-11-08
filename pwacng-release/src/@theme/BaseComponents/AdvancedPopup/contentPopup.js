import React, {useEffect, useState} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './contentPopup.module.scss';
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import RichContent from "@magento/venia-ui/lib/components/RichContent/richContent";

const ContentPopup = props => {
    const { popupData } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const [isOpen, setIsOpen] = useState(false);

    const delayInSeconds = popupData.number_x || 0;
    useEffect(() => {
        const checkDocumentReady = () => {
            if (document.readyState === 'complete') {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, delayInSeconds * 1000);

                return () => clearTimeout(timer);
            }
        };

        if (document.readyState === 'complete') {
            checkDocumentReady();
        } else {
            const handleReadyStateChange = () => {
                if (document.readyState === 'complete') {
                    checkDocumentReady();
                    document.removeEventListener('readystatechange', handleReadyStateChange);
                }
            };
            document.addEventListener('readystatechange', handleReadyStateChange);

            return () => document.removeEventListener('readystatechange', handleReadyStateChange);
        }
    }, [delayInSeconds]);

    return (
        <>
            <Dialog
                isOpen={isOpen}
                onCancel={() => setIsOpen(false)}
                shouldBorderlessStyle={true}
                shouldShowButtons={false}
                setScrollLock={false}
                classes={{
                    propModal: classes.advancedPopup
                }}
            >
                <RichContent html={popupData.html_content} />
                {
                    popupData.css_style && <style>{popupData.css_style}</style>
                }
            </Dialog>
        </>
    );
};

export default ContentPopup;
