import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {createGlobalStyle} from 'styled-components';
import {App} from 'App';
import {Callback} from 'Callback';
import {HKThemeProvider, SnackbarProvider} from 'providers';

const TRANSITION = 6000;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: black;
    color: #777;
    font-family: monospace;
  }

  button, label {
    transition: all ${TRANSITION}ms ease !important;
  }
`;

const Providers = () => (
  <HKThemeProvider>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </HKThemeProvider>
);

const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/callback" component={Callback} />
      <Route exact path="*" component={Providers} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(
  <>
    <GlobalStyle />
    <Router />
  </>,
  document.getElementById('root')
);
