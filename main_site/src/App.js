import React from 'react'
import { Layout, Menu } from 'antd'
import Swagger from './Swagger'
import FrontPage from './FrontPage'
import './App.css'
import 'antd/dist/antd.css'
import { HashRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom'

const { Content, Footer, Header } = Layout
const lineHeight={lineHeight:'64px'}
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
      
      <Header>
        <Switch>
          <Redirect from='/' exact to='/home' />
          <Route path='/:page' component={AppMenu} />     
        </Switch>     
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
