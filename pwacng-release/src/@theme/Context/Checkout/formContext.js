import React, {createContext, useRef, useState} from "react";

const FormContext = createContext();

const FormProvider = ({children}) => {
    const formShippingRef = useRef(null);
    const formVatRef = useRef(null);
    const formDeliveryRef = useRef(null);
    const [ isNextStep, setIsNextStep ] = useState(false);

    return (
        <FormContext.Provider value={{ formShippingRef, formVatRef, isNextStep, setIsNextStep, formDeliveryRef }}>
            {children}
        </FormContext.Provider>
    )
}

export {
    FormContext,
    FormProvider
}
