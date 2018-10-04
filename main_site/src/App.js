import React from 'react'
//import { Layout, Row, Col, Icon } from 'antd'
import { Container, Row, Col } from 'reactstrap'
import Swagger from './pages/Swagger'
import FrontPage from './pages/FrontPage'
import Developers from './pages/Developers'
import Login from './pages/Login'
import Register from './pages/Register'
import AppMenu from './components/AppMenu'
import './App.css'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import Logo from './Logo.js'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import awsApp from './reducers'
import Products from './pages/Products'
import {menuBarHeight} from './styles/menu'
import {HOME} from './routes/names'
//const { Content, Footer, Header } = Layout
const store=createStore(awsApp)

const LogoC=()=><Logo height={menuBarHeight} width={menuBarHeight} className='logo-primary'/>

const rmPadding={padding:0}
const marginRight={marginRight:'30%', float:'right'}

const App = () => (
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <div>
        <Switch>
          <Redirect from='/' exact to='/home' />
          <Route path='/:page' component={AppMenu} />     
        </Switch>    
        <Route
          exact
          path={HOME}
          component={FrontPage}
        />
        <Route 
          path="/products" 
          component={Products} 
        />
        <Route 
          path="/developers" 
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
          path="/developers/api_docs" 
          component={Swagger} 
        />
      </div>
    </Router>
  </Provider>
)

export default App
