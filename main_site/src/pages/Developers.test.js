import React from 'react'
import { Provider } from 'react-redux'
import * as Swagger from '../components/Swagger' //overwride swagger
import {
    shallow, mount
} from 'enzyme'
import Developers from './Developers'
import configureStore from 'redux-mock-store'
const mockStore = configureStore([])
it('shallowly renders', ()=>{
    const developer=shallow(<Developers/>)
    expect(developer).toBeDefined()
})
it('fully mounts', ()=>{
    const initialState={
        modal:{
            isOpen:true
        },
        auth:{
            isSignedIn:true,
            apiKey:'hello'
        },
        client:{}
    }
    const store=mockStore(initialState)
    Swagger.default=()=><div></div>
    const developer=mount(
    <Provider store={store}>
        <Developers/> 
    </Provider>
    )
    expect(developer).toBeDefined()
})