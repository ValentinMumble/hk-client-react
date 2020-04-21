import React from 'react';
import {ThemePProvider} from 'theme';
import {SnackbarProvider} from 'Snackbar';
import {HK} from 'HK';

const App = () => (
  <ThemePProvider>
    <SnackbarProvider>
      <HK />
    </SnackbarProvider>
  </ThemePProvider>
);

export {App};
