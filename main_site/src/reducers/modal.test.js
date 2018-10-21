import modal from './modal'
import {
    TOGGLE_OPEN
} from '../actions/constants'

it('returns false default', ()=>{
    const state=modal(undefined, {type:'hello'})
    expect(state).toEqual({
        isOpen:false
    })
})
it('returns true with action', ()=>{
    const state=modal(undefined, {type:TOGGLE_OPEN})
    expect(state).toEqual({
        isOpen:true
    })
})
it('returns false with action after true', ()=>{
    const state=modal({isOpen:true}, {type:TOGGLE_OPEN})
    expect(state).toEqual({
        isOpen:false
    })
})