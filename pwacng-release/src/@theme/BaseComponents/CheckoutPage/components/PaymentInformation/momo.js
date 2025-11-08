const Momo = props => {
    const {instructions, classes} = props;

    return instructions ? (
        <div className={classes.root}>
            <div className={classes.note}>
                {instructions} <strong>MoMo</strong>
            </div>
        </div>
    ) : null
}

export default Momo
