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
import {
    HOME, DEVELOPERS, PRODUCTS, 
    REGISTER, LOGIN, MARKETPLACE, SUBSCRIPTIONS
} from '../routes/names'
import {getCatalog} from '../services/api-catalog'
import {logout} from '../services/auth'
import {menuBarHeight} from '../styles/menu'
import Loading from './Loading'
import AsyncLoad from './AsyncLoad'
import {init} from '../services/auth'
import {toggleNavBar} from '../actions/menu'

const LogOut=({logout, cognitoUser})=><NavLink href="#" onClick={()=>logout(cognitoUser)}>Log Out</NavLink>

//the "purchase" link will go to amazon web store
const AppMenu=({
    toggleNavBar, isSignedIn, 
    isOpen, logout, init, 
    cognitoUser,
    paidUsagePlanId, 
    freeUsagePlanId,
    token, isFromMarketPlace
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
                <NavLink to={MARKETPLACE} tag={Link} >Purchase</NavLink>
            </NavItem>
            {isSignedIn?<NavItem>
                <NavLink to={SUBSCRIPTIONS} tag={Link} >Subscriptions</NavLink>
            </NavItem>:null}
            <NavItem>
                <AsyncLoad onLoad={()=>init({token, paidUsagePlanId, isFromMarketPlace})} loading={Loading} requiredObject={freeUsagePlanId!==undefined} render={()=>isSignedIn?
                    <LogOut 
                        logout={logout} 
                        cognitoUser={cognitoUser}
                    />:
                    <NavLink to={LOGIN} tag={Link}>Log In</NavLink>
                }/>
            </NavItem>
            {isSignedIn?null:<NavItem>
                <NavLink to={REGISTER} tag={Link} >Sign Up</NavLink>
            </NavItem>}
            
        </Nav>
    </Collapse>
</Navbar>
)


const mapStateToProps=({auth:{isSignedIn, cognitoUser, token, paidUsagePlanId, isFromMarketPlace}, menu, catalog:{free:{id:freeUsagePlanId}}})=>({
    isSignedIn,
    cognitoUser,
    isOpen:menu,
    token,
    paidUsagePlanId, 
    freeUsagePlanId,
    isFromMarketPlace
})
//TODO!! this is too similar to mapStateToProps in SignIn...consider extracting into one function
const mapDispatchToProps=dispatch=>({
    logout:logout(dispatch),
    init:({paidUsagePlanId, token, isFromMarketPlace})=>getCatalog(dispatch).then(({value:{free:{id:freeUsagePlanId}}})=>init(dispatch)({token, paidUsagePlanId, isFromMarketPlace, freeUsagePlanId})),
    toggleNavBar:toggleNavBar(dispatch)
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppMenu)