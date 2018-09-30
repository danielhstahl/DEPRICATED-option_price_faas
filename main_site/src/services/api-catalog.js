import {url} from './aws'
import {
    UPDATE_CATALOG, 
    UPDATE_SUBSCRIPTIONS,
    SUBSCRIPTION_ERROR,
    INSERT_SUBSCRIPTION,
    CATALOG_ERROR,
    CONFIRM_SUBSCRIPTION,
    DELETE_SUBSCRIPTION,
    UPDATE_USAGE
} from '../actions/constants'
export const getCatalog=dispatch=>headers=>fetch(
    `${url}/catalog`, {headers}
)
.then(({data})=>dispatch({type:UPDATE_CATALOG, value:data}))
.catch(err=>dispatch({type:CATALOG_ERROR, err}))


export const getSubscriptions=dispatch=>headers=>fetch(
    `${url}/subscriptions`, {headers}
)
.then(({data})=>dispatch({type:UPDATE_SUBSCRIPTIONS, value:data}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))


export const addSubscription=dispatch=>(usagePlanId, headers)=>fetch(
    `${url}/subscriptions/${usagePlanId}`, {headers, method:'PUT'}
)
.then(({data})=>dispatch({type:INSERT_SUBSCRIPTION, value:data}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const confirmMarketplaceSubscription=dispatch=>(
    usagePlanId, token, headers
)=>fetch(
    `${url}/marketplace-subscriptions/${usagePlanId}`, 
    {headers, method:'PUT'}
)
.then(({data})=>dispatch({type:CONFIRM_SUBSCRIPTION, value:data}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const unsubscribe=dispatch=>(
    usagePlanId, headers
)=>fetch(
    `${url}/subscriptions/${usagePlanId}`, 
    {headers, method:'DELETE'}
)
.then(()=>dispatch({type:DELETE_SUBSCRIPTION, value:usagePlanId}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const getUsage=dispatch=>(
    usagePlanId, headers
)=>fetch(
    `${url}/subscriptions/${usagePlanId}/usage`, 
    {headers}
)
.then(({data})=>dispatch({type:UPDATE_USAGE, value:data}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))