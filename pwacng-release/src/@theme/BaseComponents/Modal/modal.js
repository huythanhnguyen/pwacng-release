import React from "react";
import {Portal} from "@magento/venia-ui/lib/components/Portal";

import defaultClasses from './modal.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";

const Modal = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const {
        isOpen,
        children,
        title,
        handleClose,
        isMask,
        isHide,
        zLarge = false
    } = props;

    const zLargeClass = zLarge ? classes.zLarge : '';
    const modalClass = isOpen ? classes.modal_open : classes.modal;
    const modalHide = isHide ? classes.modal_hide : '';

    return (
        <Portal>
            <aside className={`${modalClass} ${classes.propModal} ${modalHide} ${zLargeClass}`}>
                {
                    isMask && (
                        <button
                            className={classes.mask}
                            onClick={handleClose ? handleClose : null}
                            type="reset"
                        />
                    )
                }
                <div className={`${classes.innerWrapper} ${classes.innerWidth}`}>
                    <div className={`${classes.modalHeader} ${classes.propModalHeader}`}>
                        {title}
                        {
                            handleClose && (
                                <button onClick={handleClose}></button>
                            )
                        }
                    </div>
                    <div className={`${classes.modalContent} ${classes.propModalContent}`}>
                        {children}
                    </div>
                </div>
            </aside>
        </Portal>
    )
}

export default Modal
