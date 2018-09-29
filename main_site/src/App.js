import React from 'react'
import { Layout, Menu, Row, Col, Icon } from 'antd'
import Swagger from './Swagger'
import FrontPage from './FrontPage'
import './App.css'
import { HashRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom'
import Logo from './Logo.js'
const LogoC=()=><Logo height='64px' width='64px' className='logo-primary'/>
const { Content, Footer, Header } = Layout
const lineHeight={lineHeight:'64px'}
const rmPadding={padding:0}
const AppMenu=({match:{params:{page}}})=>(
  <Menu
      mode="horizontal"
      theme="dark"
      selectedKeys={[page]}
      style={lineHeight}
  >
    <Menu.Item key='home'><Link to='/home'>Home</Link></Menu.Item>
    <Menu.Item key='api_docs'><Link to='/api_docs'>API Docs</Link></Menu.Item>
  </Menu>
)
const App = () => (
  <Router>
    <Layout>
      <Header style={rmPadding}>
        
        <Row >
          <Col xs={6} md={4} lg={4} >
            <Icon component={LogoC} style={{marginRight:'40%', float:'right'}} />
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
      </Content>
      <Footer></Footer>
    </Layout>
  </Router>
)

export default App
