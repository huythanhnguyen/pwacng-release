import React from "react";
import {Helmet} from "react-helmet-async";

const CommonSchema = props => {
    return (
        <Helmet>
            <script type="application/ld+json">
                {
                    JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Organization",
                        "name": "MM Mega Market Việt Nam",
                        "alternateName": "Trung Tâm MM Mega Market Vietnam",
                        "url": "https://online.mmvietnam.com/",
                        "logo": "https://cdn-b2c.mmpro.vn/MMLogo-21v.svg"
                    })
                }
            </script>
        </Helmet>
    )
}

export default CommonSchema
