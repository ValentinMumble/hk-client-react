import React, { createContext, useState, useContext } from 'react';
import { Snackbar } from '@material-ui/core';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  return (
    <SnackbarContext.Provider value={{ setAlerts }}>
      {children}
      {alerts.map(alert => (
        <Snackbar key={alert}>{alert}</Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};
