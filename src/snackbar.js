import React, { createContext, useState, useContext, useEffect } from 'react';
import { Snackbar, SnackbarContent } from '@material-ui/core';
import { useTheme } from './theme';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    color: '#000',
    backgroundColor: '#fff'
  });
  const [isOpen, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const { theme } = useTheme();

  const snack = (message, duration = 2000, backgroundColor = theme.palette.primary.main) => {
    message &&
      setSnackbar(snackbar => ({
        ...snackbar,
        message,
        duration,
        backgroundColor,
        color: theme.palette.getContrastText(backgroundColor)
      }));
  };

  useEffect(() => snackbar.message && setOpen(true), [snackbar]);

  return (
    <SnackbarContext.Provider value={{ snack }}>
      {children}
      <Snackbar
        key={alert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={isOpen}
        autoHideDuration={snackbar.duration}
        onClose={handleClose}>
        <SnackbarContent
          style={{
            backgroundColor: snackbar.backgroundColor,
            color: snackbar.color
          }}
          message={snackbar.message}
        />
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
