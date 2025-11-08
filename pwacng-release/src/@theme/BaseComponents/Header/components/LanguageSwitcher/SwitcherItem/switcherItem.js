import React, {useCallback} from 'react';

const SwitcherItem = props => {

    const {
        onClick,
        option,
        classes
    } = props;

    const handleClick = useCallback(() => {
        onClick(option);
    }, [option, onClick]);

    return (
        <button onClick={handleClick} className={`${option.code}`}>
            <span className={classes.text}>
                {option.label}
            </span>
        </button>
    )
}

export default SwitcherItem
