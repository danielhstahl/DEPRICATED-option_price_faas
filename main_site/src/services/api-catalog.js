import {url} from './aws'
import {
    UPDATE_CATALOG, 
    UPDATE_SUBSCRIPTIONS,
    SUBSCRIPTION_ERROR,
    CATALOG_ERROR,
    CONFIRM_SUBSCRIPTION,
    DELETE_SUBSCRIPTION,
    UPDATE_USAGE
} from '../actions/constants'

const convertJson=res=>res.json()
export const getCatalog=dispatch=>()=>fetch(`${url}/catalog`)
.then(convertJson)
.then(({items})=>{
    console.log(items)
    dispatch({type:UPDATE_CATALOG, value:items})
})
.catch(err=>dispatch({type:CATALOG_ERROR, err}))

/*
export const getSubscriptions=dispatch=>client=>client.invokeApi(
    {},
    '/subscriptions', 
    'GET',
    {}, {}
)
.then(({data})=>dispatch({type:UPDATE_SUBSCRIPTIONS, value:data}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))*/

export const registerFree=dispatch=>(usagePlanId, client)=>client.invokeApi(
    {},
    `/subscriptions/${usagePlanId}`,
    'PUT',
    {}, {}
)
//.then(()=>getSubscriptions(dispatch)(client))
//.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))


const marketPlaceSubscribe=dispatch=>(
    usagePlanId, token, client
)=>client.invokeApi(
    {},
    `/marketplace-subscriptions/${usagePlanId}`, 
    'PUT',
    {}, {token}
)
//.then(({data})=>dispatch({type:CONFIRM_SUBSCRIPTION, value:data}))
//.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const registerPaid=dispatch=>(paidUsagePlanId, freeUsagePlanId, token, client)=>Promise.all([
    removeSubscription(dispatch)(freeUsagePlanId, client),
    marketPlaceSubscribe(dispatch)(paidUsagePlanId, token, client)
]).then(data=>console.log(data)).catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))


export const removeSubscription=dispatch=>(
    usagePlanId, client
)=>client.invokeApi(
    {},
    `/subscriptions/${usagePlanId}`, 
    'DELETE',
    {}, {}
)
//.then(()=>dispatch({type:DELETE_SUBSCRIPTION, value:usagePlanId}))
//.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const getUsage=dispatch=>(
    usagePlanId, client
)=>client.invokeApi(
    {},
    `/subscriptions/${usagePlanId}/usage`,
    'GET', 
    {}, {}
)
.then(({data})=>dispatch({type:UPDATE_USAGE, value:data}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))