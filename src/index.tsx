import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {createGlobalStyle} from 'styled-components';
import {App} from 'App';
import {Callback} from 'Callback';
import {HKThemeProvider, SnackbarProvider, SocketProvider} from 'providers';

const TRANSITION = 800;

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
  /*fix this shit*/
  button, label, .MuiSlider-root {
    transition: all ${TRANSITION}ms ease !important;
  }
`;

const Providers = () => (
  <HKThemeProvider>
    <SnackbarProvider>
      <SocketProvider
        url={`${process.env.REACT_APP_SERVER_URL}/connect`}
        opts={{autoConnect: false, reconnection: false}}
      >
        <App />
      </SocketProvider>
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
