import catalog from './catalog'
import {
    UPDATE_CATALOG, UPDATE_USAGE,
    DELETE_SUBSCRIPTION,
    ADD_SUBSCRIPTION
} from '../actions/constants'

it('returns updated state', ()=>{
    const action={type:UPDATE_CATALOG, value:'hello world'}
    expect(catalog(undefined, action)).toEqual('hello world')
})
it('returns state with usage plan', ()=>{
    const action={
        type:UPDATE_USAGE, 
        value:{
            usagePlanId:'hi', 
            hello:'world'
        }
    }
    const initState={
        free:{
            id:'hi'
        },
        paid:{
            id:'something'
        }
    }
    expect(catalog(initState, action)).toEqual({
        free:{
            id:'hi',
            hello:'world'
        },
        paid:{
            id:'something'
        }
    })
})
it('returns state with add subscription', ()=>{
    const action={
        type:ADD_SUBSCRIPTION, 
        value:'hi'
    }
    const initState={
        free:{
            id:'hi'
        },
        paid:{
            id:'something'
        }
    }
    expect(catalog(initState, action)).toEqual({
        free:{
            id:'hi',
            isSubscribed:true
        },
        paid:{
            id:'something'
        }
    })
})
it('returns state with delete subscription', ()=>{
    const action={
        type:DELETE_SUBSCRIPTION, 
        value:'hi'
    }
    const initState={
        free:{
            id:'hi',
            isSubscribed:true
        },
        paid:{
            id:'something'
        }
    }
    expect(catalog(initState, action)).toEqual({
        free:{
            id:'hi',
            isSubscribed:false
        },
        paid:{
            id:'something'
        }
    })
})
it('returns state with delete subscription and no subscription', ()=>{
    const action={
        type:DELETE_SUBSCRIPTION, 
        value:'hi'
    }
    const initState={
        free:{
            id:'hi'       
        },
        paid:{
            id:'something'
        }
    }
    expect(catalog(initState, action)).toEqual({
        free:{
            id:'hi',
            isSubscribed:false
        },
        paid:{
            id:'something'
        }
    })
})
it('returns state with add subscription and subscription', ()=>{
    const action={
        type:ADD_SUBSCRIPTION, 
        value:'hi'
    }
    const initState={
        free:{
            id:'hi',
            isSubscribed:false     
        },
        paid:{
            id:'something'
        }
    }
    expect(catalog(initState, action)).toEqual({
        free:{
            id:'hi',
            isSubscribed:true
        },
        paid:{
            id:'something'
        }
    })
})