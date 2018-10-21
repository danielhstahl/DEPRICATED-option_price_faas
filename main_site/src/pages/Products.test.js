import React from 'react'
import { Provider } from 'react-redux'
import {
    shallow, mount
} from 'enzyme'
import Products from './Products'
import {MemoryRouter} from 'react-router-dom'
import configureStore from 'redux-mock-store'
const mockStore = configureStore([])
it('shallowly renders', ()=>{
    const products=shallow(<Products/>)
    expect(products).toBeDefined()
})
it('fully mounts', ()=>{
    const usagePlan={
        quota:{
            period:'MONTH'
        }
    }
    const free=usagePlan
    const paid={...usagePlan, isSubscribed:true}
    const initialState={
        catalog:{
            free,
            paid
        },
        auth:{}
    }
    const store=mockStore(initialState)
    const products=mount(
    <Provider store={store}>
        <MemoryRouter>
            <Products/> 
        </MemoryRouter>
    </Provider>
    )
    expect(products).toBeDefined()
})