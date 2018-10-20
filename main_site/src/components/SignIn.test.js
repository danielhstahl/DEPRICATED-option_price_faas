import React from 'react'
import Loading from '../components/Loading'
import {SignIn} from './SignIn'
import {shallow} from 'enzyme'
const gf=()=>{}
const defaultParams={
    register:gf,
    history:{
        goBack:gf,
        push:gf,
        length:1
    },
    loginError:gf,
    updateLoggingIn:gf,
    isFromMarketPlace:true
}
it('renders without error', ()=>{
    const signIn=shallow(<SignIn
        {...defaultParams}
        isLoggingIn={false}
    />)
    expect(signIn).toBeDefined()
})

it('renders error message with error', ()=>{
    const signIn=shallow(<SignIn
        {...defaultParams}
        error={{message:'an error'}}
        isLoggingIn={false}
    />)
    expect(signIn.findWhere(v=>v.text()==='an error').length).toBeGreaterThan(0)
})
it('renders loading when is logging in', ()=>{
    const signIn=shallow(<SignIn
        {...defaultParams}
        isLoggingIn={true}
    />)
    expect(signIn.find(Loading).length).toEqual(1)
})