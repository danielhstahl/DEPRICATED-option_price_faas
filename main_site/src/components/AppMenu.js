import React from 'react'
import { Link } from 'react-router-dom'
import {connect} from 'react-redux'
import { Menu } from 'antd'
import {logout} from '../services/auth'
import {menuBarHeight} from '../styles/menu'
import Loading from './Loading'
import AsyncLoad from './AsyncLoad'
import {init} from '../services/auth'
const lineHeight={lineHeight:menuBarHeight}

const LogOut=({logout, cognitoUser})=><span onClick={()=>logout(cognitoUser)}>Log Out</span>

const floatRight={float:'right'}
//the "purchase" link will go to amazon web store

const AppMenu=({match:{params:{page}}, isSignedIn, logout, init, cognitoUser})=>(
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
    {isSignedIn?'':<Menu.Item key='register' style={floatRight}>
        <Link to='/register' key='register'>Sign Up</Link>   
    </Menu.Item>}
    <Menu.Item key='login' style={floatRight}> 
        <AsyncLoad key='login' onLoad={init} loading={Loading} render={()=>isSignedIn?
            <LogOut 
                logout={logout} 
                cognitoUser={cognitoUser}
            />:
            <Link to='/login' key='signin'>Log In</Link>
        }/>
    </Menu.Item>
    
</Menu>
)

const mapStateToProps=({auth:{isSignedIn, cognitoUser}})=>({
    isSignedIn,
    cognitoUser
})
const mapDispatchToProps=dispatch=>({
    logout:logout(dispatch),
    init:init(dispatch)
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppMenu)