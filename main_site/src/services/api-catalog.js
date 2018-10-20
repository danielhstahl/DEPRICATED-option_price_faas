import {url} from './aws'
import {keys} from '../reducers/catalog'
const containsString=(match, string)=>match.toLowerCase().includes(string)
const checkKey=name=>keys.find(key=>containsString(name, key))
const convertJson=res=>res.json()
export const getCatalog=()=>fetch(`${url}/catalog`)
.then(convertJson)
.then(({items})=>items.reduce((aggr, curr)=>{
        const key=checkKey(curr.name)
        if(key){
            return {...aggr, [key]:curr}
        }
        else {
            return aggr
        }
    }, {})
)

export const registerFree=(usagePlanId, client)=>client.invokeApi(
    {},
    `/subscriptions/${usagePlanId}`,
    'PUT',
    {}, {}
)

const marketPlaceSubscribe=(
    usagePlanId, token, client
)=>client.invokeApi(
    {},
    `/marketplace-subscriptions/${usagePlanId}`, 
    'PUT',
    {}, {token}
)

export const registerPaid=(paidUsagePlanId, freeUsagePlanId, token, client)=>Promise.all([
        removeSubscription(freeUsagePlanId, client),
        marketPlaceSubscribe(paidUsagePlanId, token, client)
    ]).then(data=>console.log(data))

export const unregisterPaid=(paidUsagePlanId, freeUsagePlanId, client)=>Promise.all([
        removeSubscription(paidUsagePlanId, client),
        registerFree(freeUsagePlanId, client)
    ]).then(data=>console.log(data))


export const removeSubscription=(
    usagePlanId, client
)=>client.invokeApi(
    {},
    `/subscriptions/${usagePlanId}`, 
    'DELETE',
    {}, {}
)
const getCurrentMonth=()=>{
    const date = new Date()
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toJSON().split('T')[0]
    const end = new Date().toJSON().split('T')[0]
    return {start, end}
}

export const getUsage=(
    usagePlanId, client
)=>client.invokeApi(
    {},
    `/subscriptions/${usagePlanId}/usage`,
    'GET', 
    {queryParams:getCurrentMonth()}, {}
)


export const getSubscriptions=client=>client.invokeApi(
    {},
    '/subscriptions', 
    'GET',
    {}, {}
)