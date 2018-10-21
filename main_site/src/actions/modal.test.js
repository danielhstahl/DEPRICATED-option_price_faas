import {toggleOpen} from './modal'
import { TOGGLE_OPEN } from './constants'

it('calls toggle open', ()=>{
    const dispatch=jest.fn()
    toggleOpen(dispatch)()
    expect(dispatch.mock.calls.length).toEqual(1)
    expect(dispatch.mock.calls[0][0]).toEqual({type:TOGGLE_OPEN})
})