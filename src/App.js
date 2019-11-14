import React from 'react';
import { ThemePProvider } from './theme';
import { SnackbarProvider } from './snackbar';
import { HK } from './HK';

export const App = () => {
  return (
    <ThemePProvider>
      <SnackbarProvider>
        <HK />
      </SnackbarProvider>
    </ThemePProvider>
  );
};
