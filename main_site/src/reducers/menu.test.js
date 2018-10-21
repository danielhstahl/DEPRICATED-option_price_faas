import menu from './menu'
import {
    TOGGLE_MENU_NAV
} from '../actions/constants'

it('returns false default', ()=>{
    const state=menu(undefined, {type:'hello'})
    expect(state).toEqual(false)
})
it('returns true with action', ()=>{
    const state=menu(undefined, {type:TOGGLE_MENU_NAV})
    expect(state).toEqual(true)
})
it('returns false with action after true', ()=>{
    const state=menu(true, {type:TOGGLE_MENU_NAV})
    expect(state).toEqual(false)
})