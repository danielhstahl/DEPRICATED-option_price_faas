import React from 'react'
import { Layout, Menu, Row, Col, Icon } from 'antd'
import Swagger from './swagger/Swagger'
import FrontPage from './frontPage/FrontPage'
import './App.css'
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom'
import Logo from './Logo.js'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import awsApp from './reducers'
import Products from './products/Products'
import SignIn from './register/SignIn'
import {connect} from 'react-redux'
const store=createStore(awsApp)

const LogoC=()=><Logo height='64px' width='64px' className='logo-primary'/>
const { Content, Footer, Header } = Layout
const lineHeight={lineHeight:'64px'}
const rmPadding={padding:0}
const marginRight={marginRight:'30%', float:'right'}
const mapStateToProps=({auth:{isSignedIn}})=>({
  isSignedIn
})
const AppMenu=connect(
  mapStateToProps
)(({match:{params:{page}}, isSignedIn})=>(
  <Menu
      mode="horizontal"
      theme="dark"
      selectedKeys={[page]}
      style={lineHeight}
  >
    <Menu.Item key='home'><Link to='/home'>Home</Link></Menu.Item>
    <Menu.Item key='api_docs'><Link to='/api_docs'>API Docs</Link></Menu.Item>
    <Menu.Item key='purchase'><Link to='/purchase'>Purchase</Link></Menu.Item>
    <Menu.Item key='log_in'><Link to='/log_in'>{isSignedIn?"Welcome!":"Log In"}</Link></Menu.Item>
  </Menu>
))
const App = () => (
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <Layout>
        <Header style={rmPadding}>
          
          <Row >
            <Col xs={6} md={4} lg={4} >
              <Icon component={LogoC} style={marginRight} />
            </Col>
            <Col xs={18} md={20} lg={20} >
              <Switch>
                <Redirect from='/' exact to='/home' />
                <Route path='/:page' component={AppMenu} />     
              </Switch>    
            </Col>
          </Row> 
        </Header>
        <Content>
          <Route
            exact
            path="/home"
            component={FrontPage}
          />
          <Route 
            path="/api_docs" 
            component={Swagger} 
          />
          <Route 
            path="/purchase" 
            component={Products} 
          />
          <Route 
            path="/log_in" 
            component={SignIn} 
          />
        </Content>
        <Footer></Footer>
      </Layout>
    </Router>
  </Provider>
)

export default App
