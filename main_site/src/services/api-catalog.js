import {url} from './aws'
import {
    UPDATE_CATALOG, 
    SUBSCRIPTION_ERROR,
    CATALOG_ERROR,
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

export const registerFree=(usagePlanId, client)=>client.invokeApi(
    {},
    `/subscriptions/${usagePlanId}`,
    'PUT',
    {}, {}
)
//.then(()=>getSubscriptions(dispatch)(client))
//.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))


const marketPlaceSubscribe=(
    usagePlanId, token, client
)=>client.invokeApi(
    {},
    `/marketplace-subscriptions/${usagePlanId}`, 
    'PUT',
    {}, {token}
)
//.then(({data})=>dispatch({type:CONFIRM_SUBSCRIPTION, value:data}))
//.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const registerPaid=(paidUsagePlanId, freeUsagePlanId, token, client)=>Promise.all([
        removeSubscription(freeUsagePlanId, client),
        marketPlaceSubscribe(paidUsagePlanId, token, client)
    ]).then(data=>console.log(data))//.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const unregisterPaid=(paidUsagePlanId, freeUsagePlanId, token, client)=>Promise.all([
        removeSubscription(paidUsagePlanId, client),
        registerFree(freeUsagePlanId, client)
    ]).then(data=>console.log(data))//.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))


export const removeSubscription=(
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