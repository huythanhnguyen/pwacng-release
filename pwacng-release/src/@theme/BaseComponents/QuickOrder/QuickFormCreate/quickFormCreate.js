import React from 'react';
import defaultClasses from './quickFormCreate.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import {Form} from "informed";
import Field from "../../../../override/Components/Field/field";
import TextInput from "../../../../override/Components/TextInput/textInput";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import Button from "../../../../override/Components/Button/button";
import useQuickFormCreate from "../../../Talons/QuickOrder/QuickFormCreate/useQuickFormCreate";
import TextArea from "../../../../override/Components/TextArea/textArea";
import Price from "../../../../override/Components/Price/price";

const QuickFormCreate = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const talonProps = useQuickFormCreate();

    const {
        handleChange,
        containerRef,
        step,
        setStep,
        handleSubmitSingleProduct,
        addSingleProductLoading,
        addMultipleProductLoading,
        handleSubmitMultipleProduct,
        setFormSingleApi,
        setFormMultipleApi,
        handleFileChange,
        fileName,
        handleSubmitCsvFile,
        showMessageError,
        addCsvFileLoading,
        setSingleProductValue,
        autoCompleteItems,
        singleProductValue,
        setQuantityValue,
        quantityValue,
        multipleProductValue,
        setMultipleProductValue,
        fileNameBase64,
        handleFocus,
        isAutoCompleteOpen,
        handleProductClick,
        handleBlur
    } = talonProps;

    return (
        <div className={classes.block}>
            <div className={classes.blockTitle}>
                <FormattedMessage
                    id={'quickOrder.createListOrder'}
                    defaultMessage={'Create order list'}
                />
            </div>
            <div className={classes.blockContent}>
                <div className={classes.tabHeader}>
                    <div className={`${classes.tabHeaderItem} ${step === 1 ? classes.active : ''}`} onClick={() => setStep(1)}>
                        <span>
                            <FormattedMessage
                                id={'quickFormCreate.addSingleProduct'}
                                defaultMessage={'Add individual products'}
                            />
                        </span>
                    </div>
                    <div className={`${classes.tabHeaderItem} ${step === 2 ? classes.active : ''}`} onClick={() => setStep(2)}>
                        <span>
                            <FormattedMessage
                                id={'quickFormCreate.addMultiProduct'}
                                defaultMessage={'Copy & Paste the list'}
                            />
                        </span>
                    </div>
                    <div className={`${classes.tabHeaderItem} ${step === 3 ? classes.active : ''}`} onClick={() => setStep(3)}>
                        <span>
                            <FormattedMessage
                                id={'quickFormCreate.importCSV'}
                                defaultMessage={'Import CSV'}
                            />
                        </span>
                    </div>
                </div>
                <div className={classes.tabContent}>
                    {
                        step === 1 && (
                            <Form
                                onSubmit={handleSubmitSingleProduct}
                                getApi={setFormSingleApi}
                            >
                                <div className={classes.input} ref={containerRef}>
                                    <Field
                                        id={'product_sku'}
                                        label={formatMessage({
                                            id: 'global.quickFormCreateLabel',
                                            defaultMessage: 'Sku or product Name'
                                        })}
                                        optional={true}
                                    >
                                        <TextInput
                                            field={'product_sku'}
                                            id="product_sku"
                                            validate={isRequired}
                                            validateOnBlur
                                            placeholder={formatMessage({
                                                id: 'global.quickFormCreatePlaceholder',
                                                defaultMessage: 'Enter sku or product Name'
                                            })}
                                            onValueChange={handleChange}
                                            onFocus={handleFocus}
                                        />
                                    </Field>
                                    {
                                        autoCompleteItems.length > 0 && isAutoCompleteOpen && (
                                            <div className={classes.searchSuggestions}>
                                                {
                                                    autoCompleteItems.map(item => (
                                                        <div className={classes.item} key={item.id} onClick={() => handleProductClick(item.art_no)}>
                                                            <div className={classes.image}>
                                                                <div className={classes.imageWrapper}>
                                                                    <img src={item.small_image.url} alt={item.name} />
                                                                </div>
                                                            </div>
                                                            <div className={classes.details}>
                                                                <div className={classes.priceBox}>
                                                                    <div className={classes.finalPrice}>
                                                                <span>
                                                                    <Price
                                                                        value={item.price_range.maximum_price.final_price.value}
                                                                        currencyCode={item.price_range.maximum_price.final_price.currency}
                                                                    />
                                                                    {
                                                                        item.unit_ecom && (
                                                                            <> / {item.unit_ecom}</>
                                                                        )
                                                                    }
                                                                </span>
                                                                    </div>
                                                                    {
                                                                        item.price_range.maximum_price.discount.amount_off > 0 && (
                                                                            <div className={classes.regularPrice}>
                                                                                <Price
                                                                                    value={item.price_range.maximum_price.regular_price.value}
                                                                                    currencyCode={item.price_range.maximum_price.regular_price.currency}
                                                                                />
                                                                            </div>
                                                                        )
                                                                    }
                                                                    {
                                                                        item.price_range.maximum_price.discount.amount_off > 0 && (
                                                                            <span className={classes.percent}>{`-${Math.round((item.price_range.maximum_price.discount.amount_off / item.price_range.maximum_price.regular_price.value) * 100)}%`}</span>
                                                                        )
                                                                    }
                                                                </div>
                                                                <p className={classes.name}>{item.name}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                                <div className={classes.quantity}>
                                    <Field
                                        id={'product_qty'}
                                        label={formatMessage({
                                            id: 'global.qty',
                                            defaultMessage: 'Quantity'
                                        })}
                                        optional={true}
                                    >
                                        <TextInput
                                            field={'product_qty'}
                                            id="product_qty"
                                            placeholder={formatMessage({
                                                id: 'global.qty',
                                                defaultMessage: 'Quantity'
                                            })}
                                            initialValue={1}
                                            onChange={(e) => setQuantityValue(e.target.value)}
                                            onBlur={handleBlur}
                                            type="number"
                                        />
                                    </Field>
                                </div>
                                <div className={`${quantityValue && singleProductValue ? '' : classes.addToCart_disabled}`}>
                                    <Button priority={'high'} type={'submit'} disabled={addSingleProductLoading}>
                                        <FormattedMessage
                                            id={'global.addToList'}
                                            defaultMessage={'Add to list'}
                                        />
                                    </Button>
                                </div>
                            </Form>
                        )
                    }
                    {
                        step === 2 && (
                            <Form onSubmit={handleSubmitMultipleProduct} getApi={setFormMultipleApi}>
                                <div className={classes.input}>
                                    <Field
                                        id={'product_skus'}
                                        label={formatMessage({
                                            id: 'global.enterSkus',
                                            defaultMessage: 'Enter skus'
                                        })}
                                        optional={true}
                                    >
                                        <TextArea
                                            field={'product_skus'}
                                            id="product_skus"
                                            validate={isRequired}
                                            validateOnBlur
                                            placeholder={formatMessage({
                                                id: 'global.enterSkus',
                                                defaultMessage: 'Enter skus'
                                            })}
                                            onChange={e => setMultipleProductValue(e.target.value)}
                                        />
                                        <p className={classes.fieldNote}>
                                            <FormattedMessage
                                                id={'global.quickFormCreateDescription'}
                                                defaultMessage={'Each sku is separated by a comma (,)'}
                                            />
                                        </p>
                                    </Field>
                                </div>
                                <div className={`${multipleProductValue ? '' : classes.addToCart_disabled}`}>
                                    <Button priority={'high'} type={'submit'} disabled={addMultipleProductLoading}>
                                        <FormattedMessage
                                            id={'global.addToList'}
                                            defaultMessage={'Add to list'}
                                        />
                                    </Button>
                                </div>
                            </Form>
                        )
                    }
                    {
                        step === 3 && (
                            <div className={classes.importCsvWrapper}>
                                <div className={classes.importCsvTitle}>
                                    <p>
                                        <FormattedMessage
                                            id={'quickFormCreate.importCsvTitle'}
                                            defaultMessage={'The file is in .csv format and contains two columns: <highlightArtNo></highlightArtNo> and <highlightQty></highlightQty>'}
                                            values={{
                                                highlightArtNo: chunks => (
                                                    <strong className={classes.headingHighlight}>
                                                        '<FormattedMessage
                                                            id={'global.artNo'}
                                                            defaultMessage={'ArtNo'}
                                                        />'
                                                    </strong>
                                                ),
                                                highlightQty: chunks => (
                                                    <strong className={classes.headingHighlight}>
                                                        <strong className={classes.headingHighlight}>
                                                            '<FormattedMessage
                                                                id={'global.qty'}
                                                                defaultMessage={'Quantity'}
                                                            />'
                                                        </strong>
                                                    </strong>
                                                )
                                            }}
                                        />
                                    </p>
                                    <button className={classes.downloadSampleFile}>
                                        <a href={'https://mmpro.vn/quickorder/import/download/'} download="your file name">
                                            <FormattedMessage
                                                id={'global.downloadSampleFile'}
                                                defaultMessage={'Download sample file'}
                                            />
                                        </a>
                                    </button>
                                </div>
                                <Form onSubmit={handleSubmitCsvFile}>
                                    <div className={classes.actions}>
                                        <div className={classes.field}>
                                            <label>
                                                <span className={classes.label}>
                                            <FormattedMessage
                                                id={'global.chooseFile'}
                                                defaultMessage={'Choose file'}
                                            />
                                        </span>
                                                    <input
                                                        type={'file'}
                                                        onChange={e => handleFileChange(e)}
                                                        accept=".csv"
                                                    />
                                                <span className={classes.action}>
                                            <FormattedMessage
                                                id={'global.chooseFile'}
                                                defaultMessage={'Choose file'}
                                            />
                                        </span>
                                            </label>
                                            <span className={`${fileNameBase64 ? '' : classes.fileEmpty}`}>{fileName}</span>
                                        </div>
                                        {
                                            showMessageError && (
                                                <p className={classes.message}>
                                                    <FormattedMessage
                                                        id={'validation.isRequired'}
                                                        defaultMessage={'Is required.'}
                                                    />
                                                </p>
                                            )
                                        }
                                    </div>
                                    <div className={`${fileNameBase64 ? '' : classes.addToCart_disabled}`}>
                                        <Button priority={'high'} type={'submit'} disabled={addCsvFileLoading}>
                                            <FormattedMessage
                                                id={'global.addToList'}
                                                defaultMessage={'Add to list'}
                                            />
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default QuickFormCreate
