import {createContext, useContext, ReactNode} from 'react';

type SnackbarContextValue = (message: ReactNode, duration?: number, backgroundColor?: string) => void;

const SnackbarContext = createContext<SnackbarContextValue>(() => {});

const useSnackbar = () => useContext(SnackbarContext);

export {SnackbarContext, useSnackbar};
