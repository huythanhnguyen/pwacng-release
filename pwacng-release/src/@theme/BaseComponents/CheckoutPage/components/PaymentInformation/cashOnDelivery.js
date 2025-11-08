const CashOnDelivery = props => {
    const {instructions, classes} = props;

    return instructions ? (
        <div className={classes.root}>
            <div className={classes.note}>
                {instructions}
            </div>
        </div>
    ) : null
}

export default CashOnDelivery
