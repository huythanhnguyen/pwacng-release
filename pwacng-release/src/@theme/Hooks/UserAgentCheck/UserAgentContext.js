import React, {createContext, useEffect, useState} from 'react';
import {useQuery} from "@apollo/client";
import GET_USER_AGENT_QUERY from "./useUserAgentCheck.gql";
import {useLocation} from "react-router-dom";

export const UserAgentContext = createContext();

export const UserAgentProvider = ({ children }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const isMcardRoute = currentPath === '/mcard/';
    const [isLazyContent, setIsLazyContent] = useState(!isMcardRoute);

    const { data } = useQuery(GET_USER_AGENT_QUERY, {
        fetchPolicy: 'cache-first',
        skip: isMcardRoute
    });

    useEffect(() => {
        if (data?.getUserAgent) {
            const fetchedUserAgent = data.getUserAgent;
            setIsLazyContent(
                ["PingdomPageSpeed", "Chrome-Lighthouse"].some(keyword =>
                    fetchedUserAgent.includes(keyword)
                )
            );
        }
    }, [data]);

    return (
        <UserAgentContext.Provider value={{ isLazyContent, setIsLazyContent }}>
            {children}
        </UserAgentContext.Provider>
    );
};
