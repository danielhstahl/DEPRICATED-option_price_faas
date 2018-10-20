import {AppMenu, LogOut} from './AppMenu'
import React from 'react'
import { NavLink } from 'reactstrap'
import { shallow, mount } from 'enzyme'
import { BrowserRouter as Router} from 'react-router-dom'

it('renders with signedIn and isOpen', ()=>{

    const appMenu=shallow(<AppMenu
        isOpen={true}
        isSignedIn={true}
        freeUsagePlanId='hello'
    />)
    expect(appMenu).toBeDefined()
})
it('renders with signedIn and isOpen=false', ()=>{

    const appMenu=shallow(<AppMenu
        isOpen={true}
        isSignedIn={false}
        freeUsagePlanId='hello'
    />)
    expect(appMenu).toBeDefined()
})
it('renders with signedIn=false and isOpen=false', ()=>{

    const appMenu=shallow(<AppMenu
        isOpen={false}
        isSignedIn={false}
        freeUsagePlanId='hello'
    />)
    expect(appMenu).toBeDefined()
})
it('renders with signedIn=false and isOpen', ()=>{
    const appMenu=shallow(<AppMenu
        isOpen={true}
        isSignedIn={false}
        freeUsagePlanId='hello'
    />)
    expect(appMenu).toBeDefined()
})
it('has subscription link when signed in', ()=>{
    const appMenu=shallow(<AppMenu
        isOpen={true}
        isSignedIn={true}
        freeUsagePlanId='hello'
    />)
    expect(appMenu.find(NavLink).findWhere(link=>link.text()==='Subscriptions').length).toEqual(1)
})
it('has LogOut link when signed in', ()=>{
    const appMenu=mount(<Router><AppMenu
        isOpen={true}
        isSignedIn={true}
        freeUsagePlanId='hello'
    /></Router>)
    expect(appMenu.find(LogOut).length).toEqual(1)
})
it('has log in link when not signed in', ()=>{
    const appMenu=mount(<Router><AppMenu
        isOpen={true}
        isSignedIn={false}
        freeUsagePlanId='hello'
    /></Router>)
    expect(appMenu.find(NavLink).findWhere(link=>link.text()==='Log In').length).toBeGreaterThan(0)
})
it('has register link when not signed in', ()=>{
    const appMenu=shallow(<AppMenu
        isOpen={true}
        isSignedIn={false}
        freeUsagePlanId='hello'
    />)
    expect(appMenu.find(NavLink).findWhere(link=>link.text()==='Sign Up').length).toEqual(1)
})