import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {createGlobalStyle} from 'styled-components';
import {App} from 'App';
import {Callback} from 'Callback';

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

  /* .Container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
  } */
`;

const Router = () => (
  <BrowserRouter basename="/hk">
    <Switch>
      <Route exact path="/callback/" component={Callback} />
      <Route exact path="*" component={App} />
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
