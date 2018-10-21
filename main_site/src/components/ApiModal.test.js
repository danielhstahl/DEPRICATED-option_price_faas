import React from 'react'
import {shallow} from 'enzyme'
import {ApiModal} from './ApiModal'
import {Button} from 'reactstrap'

it('renders without error', ()=>{
    const modal=shallow(<ApiModal
        isOpen={true}
        toggleOpen={()=>{}}
        onLoad={()=>{}}
        apiKey='hello'
        isSignedIn={false}
    />)
    expect(modal).toBeDefined()
})
it('renders button when signed in', ()=>{
    const modal=shallow(<ApiModal
        isOpen={true}
        toggleOpen={()=>{}}
        onLoad={()=>{}}
        apiKey='hello'
        isSignedIn={true}
    />)
    expect(modal.find(Button).length).toEqual(1)
})
it('does not render button when notsigned in', ()=>{
    const modal=shallow(<ApiModal
        isOpen={true}
        toggleOpen={()=>{}}
        onLoad={()=>{}}
        apiKey='hello'
        isSignedIn={false}
    />)
    expect(modal.find(Button).length).toEqual(0)
})