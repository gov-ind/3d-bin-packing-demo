import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

import App from './App';
import store from './store';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
