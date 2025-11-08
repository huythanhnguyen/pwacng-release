import React, {useState, useEffect, useMemo} from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from './pdfCategoryDetail.module.scss';
import useListPdf from "../../Talons/ListPdf/useListPdf";
import { FormattedMessage } from "react-intl";

import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import Pagination from "@magento/venia-ui/lib/components/Pagination";

const PdfCategoryDetail = props => {
    const {categoryId} = props;
    const classes = useStyle(defaultClasses, props.classes);

    const [currentPage, setCurrentPage] = useState(1);

    const talonProps = useListPdf({
        categoryId,
        currentPage,
        pageSize: 20
    });

    const {
        data,
        loading,
        error
    } = talonProps;

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages: data?.page_info?.total_pages || 1
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryId])

    const listPdf = useMemo(() => {
        return data?.items && data.items.length > 0 ? data.items.map(item => (
            <div className={classes.item} key={item.id}>
                <a href={item.url_pdf} target='_blank'>
                    <span className={classes.imageContainer}><img src={item.url_banner} alt={item.title} /></span>
                    <p className={classes.name}>{item.title}</p>
                </a>
            </div>
        )) : (
            <FormattedMessage id="pdfCategory.emptyMessage" defaultMessage="No matching content found." />
        )
    }, [data]);

    if (loading) return <LoadingIndicator />;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className={classes.root}>
            <div className={classes.listingView}>{listPdf}</div>
            <Pagination pageControl={pageControl} />
        </div>
    );
};

export default PdfCategoryDetail;
