import { Counter } from './Components'
import { Provider } from 'react-redux';
import React from 'react'
import app from './app'
import { render } from 'react-dom';

const store = app.createStore()
render(
  <Provider store={store}>
    <>
      <Counter />
    </>
  </Provider>,
  document.getElementById('root')
)
