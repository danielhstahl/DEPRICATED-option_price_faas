import React from 'react'
import { NavLink as Link } from 'react-router-dom'
import {connect} from 'react-redux'
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap'
import Logo from '../Logo.js'
import {HOME, DEVELOPERS, PRODUCTS} from '../routes/names'
import {logout} from '../services/auth'
import {menuBarHeight} from '../styles/menu'
import Loading from './Loading'
import AsyncLoad from './AsyncLoad'
import {init} from '../services/auth'
import {toggleNavBar} from '../actions/menu'

const LogOut=({logout, cognitoUser})=><NavLink href="#" onClick={()=>logout(cognitoUser)}>Log Out</NavLink>

/*const isActive = path=>(match, location) => {
    console.log(path)
    console.log(location.pathname)
    return !!(match || path === location.pathname)
}*/
//the "purchase" link will go to amazon web store
const AppMenu=({
    toggleNavBar, isSignedIn, 
    isOpen, 
    logout, init, cognitoUser
})=>(
<Navbar
    color="light" light expand="md"
>
    <NavbarBrand><Logo height={menuBarHeight} width={menuBarHeight} className='logo-primary'/></NavbarBrand>
    <NavbarToggler onClick={toggleNavBar} />
    <Collapse isOpen={isOpen} navbar>
        <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink to={HOME} tag={Link} >Home</NavLink>
            </NavItem>
            <NavItem>
                <NavLink to={PRODUCTS} tag={Link}  >Products</NavLink>
            </NavItem>
            <NavItem>
                <NavLink to={DEVELOPERS} tag={Link} >Developers</NavLink>
            </NavItem>
            <NavItem>
                <NavLink to='/purchase' tag={Link} >Purchase</NavLink>
            </NavItem>
            <NavItem>
                <AsyncLoad onLoad={init} loading={Loading} render={()=>isSignedIn?
                    <LogOut 
                        logout={logout} 
                        cognitoUser={cognitoUser}
                    />:
                    <NavLink to='/login' tag={Link}>Log In</NavLink>
                }/>
            </NavItem>
            {isSignedIn?'':<NavItem>
                <NavLink to='/register' tag={Link} >Sign Up</NavLink>
            </NavItem>}
        </Nav>
    </Collapse>
</Navbar>
)

const mapStateToProps=({auth:{isSignedIn, cognitoUser}, menu})=>({
    isSignedIn,
    cognitoUser,
    isOpen:menu
})
const mapDispatchToProps=dispatch=>({
    logout:logout(dispatch),
    init:init(dispatch),
    toggleNavBar:toggleNavBar(dispatch)
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppMenu)