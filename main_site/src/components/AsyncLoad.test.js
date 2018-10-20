import AsyncLoad from './AsyncLoad'
import React from 'react'
import { shallow, mount } from 'enzyme'

it('renders with only onLoad', ()=>{
    const onLoad=()=>Promise.resolve()
    const asyncLoad=shallow(<AsyncLoad onLoad={onLoad}/>)
    expect(asyncLoad).toBeDefined()
})
it('renders child when provided', done=>{
    const onLoad=()=>Promise.resolve()
    const render=()=><div>Hello World</div>
    const asyncLoad=mount(<AsyncLoad 
        onLoad={onLoad} render={render}
    />)
    setTimeout(()=>{
        expect(asyncLoad.html()).toEqual('<div>Hello World</div>')
        done()
    }, 30)
})
