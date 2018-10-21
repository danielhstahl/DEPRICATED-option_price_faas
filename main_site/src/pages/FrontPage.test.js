import React from 'react'
import { Provider } from 'react-redux'
import {
    shallow, mount
} from 'enzyme'
import FrontPage from './FrontPage'
import {MemoryRouter} from 'react-router-dom'
import configureStore from 'redux-mock-store'
const mockStore = configureStore([])
it('shallowly renders', ()=>{
    const frontPage=shallow(<FrontPage/>)
    expect(frontPage).toBeDefined()
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
    const frontPage=mount(
    <Provider store={store}>
        <MemoryRouter>
            <FrontPage/> 
        </MemoryRouter>
    </Provider>
    )
    expect(frontPage).toBeDefined()
})