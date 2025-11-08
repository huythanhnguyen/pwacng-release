import React from "react";
import {Helmet} from "react-helmet-async";

const HomeSchema = props => {
    return (
        <Helmet>
            <script type="application/ld+json">
                {
                    JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "WebSite",
                        "name": "MM Mega Market Việt Nam",
                        "url": "https://online.mmvietnam.com/",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://online.mmvietnam.com/search.html?query={search_term_string}",
                            "query-input": "required name=search_query"
                        }
                    })
                }
            </script>
        </Helmet>
    )
}

export default HomeSchema
