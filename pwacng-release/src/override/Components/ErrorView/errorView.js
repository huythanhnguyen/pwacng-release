import React, { useCallback } from 'react';
import {FormattedMessage} from 'react-intl';
import {useHistory} from 'react-router-dom';
import { func, shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import defaultClasses from '@magenest/theme/BaseComponents/ErrorView/extendStyle/errorView.module.scss';

const DEFAULT_MESSAGE = 'Content not available';
const DEFAULT_PROMPT = 'Go to Home page';

const ErrorView = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const history = useHistory();

    const handleGoHome = useCallback(() => {
        history.push('/');
    }, [history]);

    const {
        message = (
            <FormattedMessage
                id={'errorView.message'}
                defaultMessage={DEFAULT_MESSAGE}
            />
        ),
        buttonPrompt = (
            <FormattedMessage
                id={'errorView.goHome'}
                defaultMessage={DEFAULT_PROMPT}
            />
        ),
        onClick = handleGoHome
    } = props;

    const handleClick = useCallback(() => {
        onClick && onClick();
    }, [onClick]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         handleGoHome();
    //     }, 5000);
    //
    //     return () => clearTimeout(timer); // Clear timeout if component unmounts
    // }, [handleGoHome]);

    return (
        <div className={classes.root} data-cy="ErrorView-root">
            <div className={classes.content}>
                <span className={classes.notFoundIcon}></span>
                <p className={classes.message} data-cy="ErrorView-message">
                    {message}
                </p>
                <div className={classes.actionsContainer}>
                    <Button priority="high" type="button" onClick={handleClick}>
                        {buttonPrompt}
                    </Button>
                </div>
            </div>
        </div>
    );
};

ErrorView.propTypes = {
    header: string,
    message: string,
    buttonPrompt: string,
    onClick: func,
    classes: shape({
        root: string,
        content: string,
        errorCode: string,
        header: string,
        message: string,
        actionsContainer: string,
        notFoundIcon: string
    })
};

export default ErrorView;
