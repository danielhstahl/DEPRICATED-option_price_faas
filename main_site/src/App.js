import React from 'react'
import Swagger from './pages/Swagger'
import FrontPage from './pages/FrontPage'
import Developers from './pages/Developers'
import Login from './pages/Login'
import Register from './pages/Register'
import AppMenu from './components/AppMenu'
import './App.css'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import awsApp from './reducers'
import Products from './pages/Products'
import {HOME, PRODUCTS, APIDOCS, DEVELOPERS} from './routes/names'

const store=createStore(awsApp)

const App = () => (
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <div>
        <AppMenu/>
        <Switch>
          <Redirect from='/' exact to={HOME} />    
        </Switch>    
        <Route
          exact
          path={HOME}
          component={FrontPage}
        />
        <Route 
          path={PRODUCTS}
          component={Products} 
        />
        <Route 
          path={DEVELOPERS}
          component={Developers} 
        />
        <Route 
          path="/register" 
          component={Register} 
        />
        <Route 
          path="/login" 
          component={Login} 
        />
        <Route 
          path={APIDOCS} 
          component={Swagger} 
        />
      </div>
    </Router>
  </Provider>
)

export default App
