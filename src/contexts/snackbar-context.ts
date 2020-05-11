import {createContext, ReactNode} from 'react';

type SnackbarContextValue = (message: ReactNode, duration?: number, backgroundColor?: string) => void;

const SnackbarContext = createContext<SnackbarContextValue>(() => {});

export {SnackbarContext};
