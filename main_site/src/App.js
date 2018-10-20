import React from 'react'
//import Swagger from './pages/Swagger'
import FrontPage from './pages/FrontPage'
import Developers from './pages/Developers'
import SuccessMarketPlaceRegister from './pages/SuccessMarketPlaceRegister'
import Login from './pages/Login'
import Register from './pages/Register'
import AppMenu from './components/AppMenu'
import './App.css'
import Loading from './components/Loading'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import Products from './pages/Products'
import {
  HOME, PRODUCTS, 
  DEVELOPERS, LOGIN, REGISTER,
  SUCCESS_MARKETPLACE, SUBSCRIPTIONS
} from './routes/names'
import Subscriptions from './pages/Subscriptions'
import { connect } from 'react-redux'

const checkIfRegisteringFromMarketplace=(
  isFromMarketPlace, 
  isSignedIn, 
  freeUsagePlanId
)=>isFromMarketPlace&&(isSignedIn===undefined||freeUsagePlanId===undefined)

const checkIfRegisteredPaid=(
  isFromMarketPlace, 
  isSignedIn
)=>isFromMarketPlace&&isSignedIn

//note that the route has to include AppMenu even though AppMenu doesn't use "page".
//this is because AppMenu won't update the selected menu unless part of a route
const App = ({
  isFromMarketPlace, isSignedIn, 
  freeUsagePlanId
}) => checkIfRegisteringFromMarketplace(
  isFromMarketPlace, isSignedIn, 
  freeUsagePlanId
)?<Loading/>:
  <Router basename={process.env.PUBLIC_URL}>
    <div>
      <Switch>
         <Route 
          path={SUCCESS_MARKETPLACE}
          component={SuccessMarketPlaceRegister} 
        />
        {checkIfRegisteredPaid(
          isFromMarketPlace,   
          isSignedIn
        )?<Redirect to={SUCCESS_MARKETPLACE}/>:null}
      </Switch>
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
        path={DEVELOPERS}
        component={Developers} 
      />
      <Route 
        path={SUBSCRIPTIONS}
        component={Subscriptions} 
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

const mapStateToProps=({
  auth:{isSignedIn, isFromMarketPlace},
  catalog:{free:{id:freeUsagePlanId}}
})=>({
  isSignedIn,
  isFromMarketPlace,
  freeUsagePlanId
})

export default connect(mapStateToProps)(App)
