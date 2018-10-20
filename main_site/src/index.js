import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import './styles/finside.scss'
import registerServiceWorker from './registerServiceWorker'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import awsApp from './reducers'
import { BrowserRouter as Router } from 'react-router-dom'
const store=createStore(awsApp)

ReactDOM.render(
    <Provider store={store}>
        <Router basename={process.env.PUBLIC_URL}>
            <App/>
        </Router>
    </Provider>, 
    document.getElementById('root')
)
registerServiceWorker()
