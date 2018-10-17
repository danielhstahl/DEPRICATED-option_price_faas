import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import './styles/finside.scss'
import registerServiceWorker from './registerServiceWorker'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import awsApp from './reducers'
const store=createStore(awsApp)
ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'))
registerServiceWorker()
