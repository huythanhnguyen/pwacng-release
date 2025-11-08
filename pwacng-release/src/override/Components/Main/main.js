import React, {useMemo, Suspense} from 'react';
import { bool, shape, string } from 'prop-types';
import { useScrollLock } from '@magento/peregrine';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Footer from '@magento/venia-ui/lib/components/Footer';
import Header from '@magento/venia-ui/lib/components/Header';
import defaultClasses from '@magento/venia-ui/lib/components/Main/main.module.css';
import mainCustomClasses from '@magenest/theme/BaseComponents/Main/extendStyle/main.module.scss';

import { MiniCartProvider } from '@magenest/theme/Context/MiniCart/MiniCartContext';
import AdvancedPopup from "@magenest/theme/BaseComponents/AdvancedPopup/advancedPopup";
import ProductLabelShape from "../ProductLabel/productLabelShape";
import {useLocation} from "react-router-dom";
import LoginAsCustomer from "@magenest/theme/BaseComponents/LoginAsCustomer/loginAsCustomer";

const ActionsSticky = React.lazy(() => import('@magenest/theme/BaseComponents/ActionsSticky'));

const Main = props => {
    const { children, isMasked, isLazyContent } = props;
    const classes = useStyle(defaultClasses, mainCustomClasses, props.classes);
    const rootClass = isMasked ? classes.root_masked : classes.root;
    const pageClass = isMasked ? classes.page_masked : classes.page;
    const location = useLocation();
    const currentPath = location.pathname;

    const shouldShowHeader = !location.pathname.includes('/checkout') && currentPath !== '/mcard/update-customer-email';

    // useScrollLock(isMasked);

    const content = useMemo(() => {
        if (currentPath.includes('/loginascustomer/login/index/secret/')) {
            return <LoginAsCustomer />
        } else {
            return (
                <>
                    {
                        !isLazyContent && shouldShowHeader && <Header />
                    }
                    <div className={pageClass}>{children}</div>
                    {
                        !isLazyContent && shouldShowHeader && <Footer />
                    }
                    {
                        !isLazyContent && shouldShowHeader && <Suspense fallback={null}><ActionsSticky /></Suspense>
                    }
                    {
                        !isLazyContent && <AdvancedPopup/>
                    }
                    <ProductLabelShape />
                </>
            )
        }
    }, [currentPath, isLazyContent, shouldShowHeader, children, pageClass])

    return (
        <MiniCartProvider>
            <main className={rootClass}>
                {content}
            </main>
        </MiniCartProvider>
    );
};

export default Main;

Main.propTypes = {
    classes: shape({
        page: string,
        page_masked: string,
        root: string,
        root_masked: string
    }),
    isMasked: bool
};
