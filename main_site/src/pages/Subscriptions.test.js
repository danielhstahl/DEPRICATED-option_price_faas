import {
    Subscriptions, convertUsage, 
    getFirstOfNestedOrNonsenseKey, renderUsage,
    SubscriptionCard
} from './Subscriptions'
import Loading from '../components/Loading'

import React from 'react'
import {shallow, mount} from 'enzyme'
import {
    Button, Alert
} from 'reactstrap'
describe('getFirstOfNestedOrNonsenseKey', ()=>{
    it('returns "key" if arr is null', ()=>{
        const arr=null
        expect(getFirstOfNestedOrNonsenseKey(arr)).toEqual('key')
    })
    it('returns "key" if arr is empty', ()=>{
        const arr=[]
        expect(getFirstOfNestedOrNonsenseKey(arr)).toEqual('key')
    })
    it('returns first element if arr has one element', ()=>{
        const arr=['hello']
        expect(getFirstOfNestedOrNonsenseKey(arr)).toEqual('hello')
    })
    it('returns first element if arr has two elements', ()=>{
        const arr=['hello', 'goodbye']
        expect(getFirstOfNestedOrNonsenseKey(arr)).toEqual('hello')
    })
})
describe('convertUsage', ()=>{
    it('throws err if items is null', ()=>{
        const items=null
        expect(()=>convertUsage(items)).toThrow()
    })
    it('returns 0 if items is empty', ()=>{
        const items={}
        expect(convertUsage(items)).toEqual(0)
    })
    it('returns 0 if items has an element of an empty array', ()=>{
        const items={hello:[[]]}
        expect(convertUsage(items)).toEqual(0)
    })
    it('returns 0 if items has two element of an empty array', ()=>{
        const items={hello:[[], []]}
        expect(convertUsage(items)).toEqual(0)
    })
    it('throws error if items has elements that are not arrays', ()=>{
        const items={hello:[2, 3]}
        expect(()=>convertUsage(items)).toThrow()
    })
    it('returns 3 if items has arrays of 1 and 2', ()=>{
        const items={hello:[[1, 'something'], [2, 'something else']]}
        expect(convertUsage(items)).toEqual(3)
    })
    
})

describe('renderUsage', ()=>{
    const subscriptionObject={
        items:{hello:[[2], [4]]},
        quota:{
            limit:10
        },
        startDate:'2107-06-06'
    }
    it('shows unregister button if unsubscribed exists and isSubscribed is true', ()=>{
        const usage=shallow(renderUsage(
            subscriptionObject,
            true,
            ()=>{}
        )())
        expect(usage.find(Alert).length).toEqual(0)
        expect(usage.find(Button).length).toEqual(1)
    })
    it('shows loading if unsubscribed exists, isSubscribed is true, and isUnregistering', ()=>{
        const usage=shallow(renderUsage(
            subscriptionObject,
            true,
            ()=>{},
            true
        )())
        expect(usage.find(Alert).length).toEqual(0)
        expect(usage.find(Loading).length).toEqual(1)
    })
    it('shows error if error', ()=>{
        const usage=shallow(renderUsage(
            subscriptionObject,
            true,
            ()=>{},
            true,
            {message:'an error!'}
        )())
        expect(usage.find(Alert).length).toEqual(1)
    })
})

describe('Subscriptions', ()=>{
    const free={
        id:'hello',
        quota:{
            limit:10,
            period:'MONTH'
        },
        isSubscribed:true
    }
    const paid={
        id:'goodbye',
        quota:{
            limit:5000,
            period:'MONTH'
        },
        isSubscribed:true
    }
    it('shows two subscription cards', ()=>{
        const subscriptions=shallow(
            <Subscriptions 
                free={free}
                paid={paid}
                isSignedIn={true}
                getUsage={()=>{}}
                removePaidSubscription={()=>{}}
                isUnRegistering={false}
            />
        )
        expect(subscriptions.find(SubscriptionCard).length).toEqual(2)
    })
})