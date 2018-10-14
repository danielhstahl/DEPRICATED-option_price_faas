import React from 'react'
//import Swagger from './pages/Swagger'
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
import {
  HOME, PRODUCTS, 
  DEVELOPERS, LOGIN, REGISTER
} from './routes/names'

const store=createStore(awsApp)

//note that the route has to include AppMenu even those AppMenu doesn't use "page".
//this is because AppMenu won't update the selected menu unless part of
//a route
const App = () => (
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <div>
        <Switch>
          <Redirect from='/' exact to={HOME} />
          <Route path='/:page' component={AppMenu}/>    
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
          path={DEVELOPERS+'/:showswagger'}
          component={Developers} 
        />
        <Route 
          path={REGISTER}
          component={Register} 
        />
        <Route 
          path={LOGIN}
          component={Login} 
        />
      </div>
    </Router>
  </Provider>
)

export default App
