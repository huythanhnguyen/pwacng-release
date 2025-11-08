import React from "react";
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Canonical = () => {
    const location = useLocation();
    const canonical = location.pathname === '/search.html' ? `${window.location.origin}${location.pathname}${location.search}` : `${window.location.origin}${location.pathname}`

    return (
        <Helmet>
            <link
                rel="canonical"
                href={canonical}
            />
        </Helmet>
    );
}

export default Canonical
