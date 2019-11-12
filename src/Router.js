import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HK } from './HK';
import Callback from './Callback';
import { SnackbarProvider } from './useSnackbar';

export default () => (
  <Router basename='/hk'>
    <SnackbarProvider>
      <Switch>
        <Route exact path='/callback/' component={Callback} />
        <Route exact path='*' component={HK} />
      </Switch>
    </SnackbarProvider>
  </Router>
);
