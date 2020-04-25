import React, {createContext, useState, useContext, useEffect, ReactNode, useCallback} from 'react';
import styled from 'styled-components';
import {Snackbar, SnackbarContent, useTheme} from '@material-ui/core';

type Snack = {
  message?: ReactNode;
  color?: string;
  backgroundColor?: string;
  duration?: number;
};

type SnackbarContextValue = (message: ReactNode, duration?: number, backgroundColor?: string) => void;

const SnackbarContext = createContext<SnackbarContextValue>(() => {});

const useSnackbar = () => useContext(SnackbarContext);

const Snickers = styled(SnackbarContent)<{background?: string; color?: string}>`
  background-color: ${({background}) => background};
  color: ${({color}) => color};
  max-width: 90vw;
`;

type SnackbarProviderProps = {
  children?: ReactNode;
};

const SnackbarProvider = ({children}: SnackbarProviderProps) => {
  const [snackbar, setSnackbar] = useState<Snack>({});
  const [isOpen, setOpen] = useState(false);
  const theme = useTheme();

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const snack = useCallback(
    (message: ReactNode, duration = 2000, backgroundColor = theme.palette.primary.main) => {
      message &&
        setSnackbar(snackbar => ({
          ...snackbar,
          message,
          duration,
          backgroundColor,
          color: 'transparent' === backgroundColor ? 'inherit' : theme.palette.getContrastText(backgroundColor),
        }));
    },
    [theme.palette]
  );

  useEffect(() => {
    snackbar.message && setOpen(true);
  }, [snackbar]);

  return (
    <SnackbarContext.Provider value={snack}>
      {children}
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={isOpen}
        autoHideDuration={snackbar.duration}
        onClose={handleClose}
      >
        <Snickers background={snackbar.backgroundColor} color={snackbar.color} message={snackbar.message} />
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export {useSnackbar, SnackbarProvider};
