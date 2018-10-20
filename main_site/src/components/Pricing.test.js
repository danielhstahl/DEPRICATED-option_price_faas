import {Pricing} from './Pricing'
import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import { shallow, mount } from 'enzyme'
const usagePlan={
    quota:{
        period:'MONTH'
    }
}
it('renders with signedIn and isSubscribed', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:true}
    const pricing=shallow(<Pricing
        isSignedIn={true}
        free={free}
        paid={paid}
    />)
    expect(pricing).toBeDefined()
})
it('renders with signedIn and not subscribed', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:false}
    const pricing=shallow(<Pricing
        isSignedIn={true}
        free={free}
        paid={paid}
    />)
    expect(pricing).toBeDefined()
})
it('renders with not signedIn and not subscribed', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:false}
    const pricing=shallow(<Pricing
        isSignedIn={false}
        free={free}
        paid={paid}
    />)
    expect(pricing).toBeDefined()
})
it('renders with not signedIn and isSubscribed', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:true}
    const pricing=shallow(<Pricing
        isSignedIn={false}
        free={free}
        paid={paid}
    />)
    expect(pricing).toBeDefined()
})

it('renders button to developer portal from free when signed in', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:false}
    const pricing=mount(<Router><Pricing
        isSignedIn={true}
        free={free}
        paid={paid}
    /></Router>)
    expect(pricing.findWhere(v=>v.text()==='Sandbox').length).toBeGreaterThan(0)
})
it('renders button to developer portal from paid when not signed in and when subscribed', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:true}
    const pricing=mount(<Router><Pricing
        isSignedIn={false}
        free={free}
        paid={paid}
    /></Router>)
    expect(pricing.findWhere(v=>v.text()==='Sandbox').length).toBeGreaterThan(0)
})
it('renders button to register from free when not signed in', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:true}
    const pricing=mount(<Router><Pricing
        isSignedIn={false}
        free={free}
        paid={paid}
    /></Router>)
    expect(pricing.findWhere(v=>v.text()==='Register Now!').length).toBeGreaterThan(0)
})
it('renders button to marketplace from free when not subscribed', ()=>{
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:false}
    const pricing=mount(<Router><Pricing
        isSignedIn={false}
        free={free}
        paid={paid}
    /></Router>)
    expect(pricing.findWhere(v=>v.text()==='Get Started!').length).toBeGreaterThan(0)
})