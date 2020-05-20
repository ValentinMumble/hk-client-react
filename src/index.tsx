import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {createGlobalStyle} from 'styled-components';
import {App} from 'App';
import {Callback} from 'Callback';
import {HKThemeProvider, SnackbarProvider, SocketProvider, TrackProvider} from 'providers';
import * as serviceWorker from './serviceWorker';

const TRANSITION = 800;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: black;
    color: white;
    font-family: monospace;
  }

  button, label, .MuiSlider-root {
    transition: color ${TRANSITION}ms ease !important;
  }
`;

const Providers = () => (
  <HKThemeProvider>
    <SnackbarProvider>
      <SocketProvider
        url={`${process.env.REACT_APP_SERVER_URL}/connect`}
        opts={{autoConnect: false, reconnection: false}}
      >
        <TrackProvider>
          <App />
        </TrackProvider>
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

serviceWorker.register();
