import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {
    shallow
} from 'enzyme'
import SuccessMarketPlaceRegister from './SuccessMarketPlaceRegister'

it('shallowly renders', ()=>{
    const marketPlaceRegister=shallow(<MemoryRouter><SuccessMarketPlaceRegister/></MemoryRouter>)
    expect(marketPlaceRegister).toBeDefined()
})