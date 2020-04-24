import React from 'react';
import {HKThemeProvider} from 'Theme';
import {SnackbarProvider} from 'Snackbar';
import {HK} from 'HK';

const App = () => (
  <HKThemeProvider>
    <SnackbarProvider>
      <HK />
    </SnackbarProvider>
  </HKThemeProvider>
);

export {App};
