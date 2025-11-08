import React, {useState, useEffect} from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { useQuery } from "@apollo/client";
import PdfCategoryQuery from "../../Talons/ListPdf/pdfCategory.gql";
import { FormattedMessage } from "react-intl";
import defaultClasses from './pdfCategory.module.scss';
import PdfCategoryDetail from "./pdfCategoryDetail";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";

const PdfCategory = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const [currentCategory, setCurrentCategory] = useState(null);

    const { data: pdfCategoryData, error, loading } = useQuery(PdfCategoryQuery, {
        fetchPolicy: 'cache-and-network'
    });

    useEffect(() => {
        if(pdfCategoryData?.listPdfCategory?.length > 0) {
            setCurrentCategory(pdfCategoryData.listPdfCategory[0].category_id);
        }
    }, [pdfCategoryData]);

    if (loading) return <LoadingIndicator />;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className={classes.root}>
            {pdfCategoryData?.listPdfCategory?.length > 0 ? (
                <div className={classes.tabs}>
                    <div className={classes.pageTitleWrapper}>
                        <div className={classes.pageTitleInner}>
                            <h1 className={classes.pageTitle}>
                                <FormattedMessage id="pdfCategory.title" defaultMessage="Promotional Flyer" />
                            </h1>
                            <div className={classes.tabTitle}>
                                {
                                    pdfCategoryData.listPdfCategory.map(item => (
                                        <button
                                            key={item.category_id}
                                            className={item.category_id === currentCategory ? `${classes.item} ${classes.active}` : classes.item}
                                            onClick={() => setCurrentCategory(item.category_id)}
                                        >
                                            {item.name}
                                            {` (${item.count || 0})`}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <PdfCategoryDetail categoryId={currentCategory}/>
                </div>
            ) : (
                <>
                    <h1 className={classes.pageTitle}>
                        <FormattedMessage id="pdfCategory.title" defaultMessage="Promotional Flyer" />
                    </h1>
                    <FormattedMessage id="pdfCategory.emptyMessage" defaultMessage="No matching content found." />
                </>
            )}
        </div>
    );
};

export default PdfCategory;
