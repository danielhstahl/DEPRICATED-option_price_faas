import {
    ADD_SUBSCRIPTION, 
    DELETE_SUBSCRIPTION, 
    IS_UNREGISTERING
} from './constants'
import {unregisterPaid} from '../services/api-catalog'

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
    unregisterPaid(paidUsagePlanId, freeUsagePlanId, client).then(()=>{
        addSubscriptionLocal(dispatch)(freeUsagePlanId)
        deleteSubscriptionLocal(dispatch)(paidUsagePlanId)
        dispatch({
            type:IS_UNREGISTERING,
            value:false
        })
    })
}

