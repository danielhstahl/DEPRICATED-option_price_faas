import loading from './loading'
import {
    IS_LOGGING_IN, 
    IS_UNREGISTERING
} from '../actions/constants'

it('returns false default', ()=>{
    const state=loading(undefined, {type:'hello'})
    expect(state).toEqual({
        isLoggingIn:false,
        isUnRegistering:false
    })
})
it('returns true when loading event is passed', ()=>{
    const state=loading(undefined, {type:IS_LOGGING_IN, value:true})
    expect(state).toEqual({
        isLoggingIn:true,
        isUnRegistering:false
    })
})
it('returns false when loading event is passed', ()=>{
    const state=loading({
        isLoggingIn:true,
        isUnRegistering:false
    }, {type:IS_LOGGING_IN, value:false})
    expect(state).toEqual({
        isLoggingIn:false,
        isUnRegistering:false
    })
})