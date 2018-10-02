import React from 'react'
import { Link } from 'react-router-dom'
import {connect} from 'react-redux'
import { Menu, Popover } from 'antd'
import {logout} from '../services/auth'
import {menuBarHeight} from '../styles/menu'
import SignIn from '../components/SignIn'
const lineHeight={lineHeight:menuBarHeight}
const mapStateToProps=({auth:{isSignedIn}})=>({
    isSignedIn
})
const mapDispatchToProps=dispatch=>({
    logout:logout(dispatch)
})
const LogOut=({logout})=><span onClick={logout}>Log Out</span>
const SignInMenu=()=>(
    <Popover
        trigger="click"
        content={<SignIn/>}
    >
        Sign In
    </Popover>
)
//the "purchase" link will go to amazon web store

const AppMenu=({match:{params:{page}}, isSignedIn, logout})=>(
<Menu
    mode="horizontal"
    theme="dark"
    selectedKeys={[page]}
    style={lineHeight}
>
    <Menu.Item key='home'><Link to='/home'>Home</Link></Menu.Item>
    <Menu.Item key='products'><Link to='/products'>Products</Link></Menu.Item>
    <Menu.Item key='developers'><Link to='/developers'>Developers</Link></Menu.Item>
    <Menu.Item key='purchase'><Link to='/purchase'>Purchase</Link></Menu.Item>
    <Menu.Item key='login'> {isSignedIn?<LogOut logout={logout}/>:<SignInMenu/>}</Menu.Item>
</Menu>
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppMenu)