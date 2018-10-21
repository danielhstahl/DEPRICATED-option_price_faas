import React from 'react'
import { Provider } from 'react-redux'
import {
    shallow, mount
} from 'enzyme'
import Register from './Register'
import {MemoryRouter, Route} from 'react-router-dom'
import configureStore from 'redux-mock-store'
const mockStore = configureStore([])
it('shallowly renders', ()=>{
    const register=shallow(<Register/>)
    expect(register).toBeDefined()
})
it('fully mounts with error', ()=>{
    const initialState={
        loading:{
            isLoggingIn:false
        },
        auth:{
            token:'',
            paidUsagePlanId:'hello',
            isFromMarketPlace:false
        },
        errors:{
            loginError:{
                message:'error'
            }
        },
        catalog:{
            free:{
                id:'hello'
            }
        }
    }
    const store=mockStore(initialState)
    const register=mount(
    <Provider store={store}>
        <MemoryRouter>
            <Route component={Register}/> 
        </MemoryRouter>
    </Provider>
    )
    expect(register).toBeDefined()
})
it('fully mounts without error', ()=>{
    const initialState={
        loading:{
            isLoggingIn:false
        },
        auth:{
            token:'',
            paidUsagePlanId:'hello',
            isFromMarketPlace:false
        },
        errors:{
        },
        catalog:{
            free:{
                id:'hello'
            }
        }
    }
    const store=mockStore(initialState)
    const register=mount(
    <Provider store={store}>
        <MemoryRouter>
            <Route component={Register}/> 
        </MemoryRouter>
    </Provider>
    )
    expect(register).toBeDefined()
})