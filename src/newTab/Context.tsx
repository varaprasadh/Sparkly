import React, { createContext } from 'react';


export const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'SET_BACKGROUND': {
            const { type, key} = action.payload;
            // store local
            const appBackground = {
                type,
                key
            };
            chrome.storage.sync.set({ appBackground});
            return {
                ...state,
                appBackground
            };
        };
        default:
            return state;
        }
    }


export const AppContext = createContext({});
