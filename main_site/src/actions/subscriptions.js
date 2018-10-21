import {
    ADD_SUBSCRIPTION, 
    DELETE_SUBSCRIPTION, 
    IS_UNREGISTERING,
    UPDATE_CATALOG, 
    NO_SUBSCRIPTION_ERROR,
    SUBSCRIPTION_ERROR,
    UPDATE_USAGE
} from './constants'
import {unregisterPaid, getUsage, getCatalog} from '../services/api-catalog'

export const addSubscriptionLocal=dispatch=>usagePlanId=>dispatch({
    type:ADD_SUBSCRIPTION,
    value:usagePlanId
})

export const deleteSubscriptionLocal=dispatch=>usagePlanId=>dispatch({
    type:DELETE_SUBSCRIPTION,
    value:usagePlanId
})

export const removePaidSubscription=dispatch=>(paidUsagePlanId, freeUsagePlanId, client)=>{
    dispatch({
        type:IS_UNREGISTERING,
        value:true
    })
    unregisterPaid(paidUsagePlanId, freeUsagePlanId, client)
    .then(()=>{
        addSubscriptionLocal(dispatch)(freeUsagePlanId)
        deleteSubscriptionLocal(dispatch)(paidUsagePlanId)
        dispatch({type:NO_SUBSCRIPTION_ERROR})
    })
    .catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))
    .then(()=>dispatch({
            type:IS_UNREGISTERING,
            value:false
        })
    )
}

export const getSubscriptionUsage=dispatch=>(usagePlanId, client)=>getUsage(
    usagePlanId, 
    client
)
.then(({data})=>dispatch({type:UPDATE_USAGE, value:data}))
.then(()=>dispatch({type:NO_SUBSCRIPTION_ERROR}))
.catch(err=>dispatch({type:SUBSCRIPTION_ERROR, err}))

export const getPossibleSubscriptions=dispatch=>getCatalog()
.then(value=>dispatch({type:UPDATE_CATALOG, value}))
