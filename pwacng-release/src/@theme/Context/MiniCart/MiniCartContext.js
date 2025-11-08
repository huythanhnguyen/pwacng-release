import React, { createContext, useState } from 'react';

export const MiniCartContext = createContext();

export const MiniCartProvider = ({ children }) => {
    const [miniCartProductList, setMiniCartProductList] = useState({});
    const [ miniCartInfo, setMiniCartInfo ] = useState({});

    return (
        <MiniCartContext.Provider value={{ miniCartProductList, setMiniCartProductList, miniCartInfo, setMiniCartInfo }}>
            {children}
        </MiniCartContext.Provider>
    );
};
