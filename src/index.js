import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { App } from './App';
import { Callback } from './Callback';

const Routes = () => (
  <BrowserRouter basename='/hk'>
    <Switch>
      <Route exact path='/callback/' component={Callback} />
      <Route exact path='*' component={App} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<Routes />, document.getElementById('root'));
