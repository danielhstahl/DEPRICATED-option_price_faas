import {toggleNavBar} from './menu'
import { TOGGLE_MENU_NAV } from './constants'

it('calls toggle_menu_nav', ()=>{
    const dispatch=jest.fn()
    toggleNavBar(dispatch)()
    expect(dispatch.mock.calls.length).toEqual(1)
    expect(dispatch.mock.calls[0][0]).toEqual({type:TOGGLE_MENU_NAV})
})