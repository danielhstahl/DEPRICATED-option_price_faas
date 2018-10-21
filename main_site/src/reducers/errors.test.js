import errors from './errors'
import {
    NO_SUBSCRIPTION_ERROR,
    SUBSCRIPTION_ERROR
} from '../actions/constants'

it('returns null default', ()=>{
    const state=errors(undefined, {type:'hello'})
    expect(state).toEqual({
        subscriptionError:null,
        loginError:null,
        apiError:null,
    })
})
it('returns error when error event is passed', ()=>{
    const state=errors(undefined, {type:SUBSCRIPTION_ERROR, value:'error!'})
    expect(state).toEqual({
        subscriptionError:'error!',
        loginError:null,
        apiError:null,
    })
})
it('returns null when error and then not', ()=>{
    const state=errors({
        subscriptionError:'error!',
        loginError:null,
        apiError:null,
    }, {type:NO_SUBSCRIPTION_ERROR})
    expect(state).toEqual({
        subscriptionError:null,
        loginError:null,
        apiError:null,
    })
})