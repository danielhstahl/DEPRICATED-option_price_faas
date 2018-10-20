import {
    UPDATE_CATALOG, UPDATE_USAGE,
    DELETE_SUBSCRIPTION,
    ADD_SUBSCRIPTION
} from '../actions/constants'

const defaultState={
    free:{quota:{period:'month'}},
    paid:{quota:{period:'month'}}
}
export const keys=Object.keys(defaultState)
const updateCatalog=(usagePlanId, obj, state)=>keys.reduce((aggr, key)=>state[key].id===usagePlanId?{...aggr, [key]:{...aggr[key], ...obj}}:aggr, state)
export default (state=defaultState, action)=>{
    switch(action.type){
        case UPDATE_CATALOG:
            return action.value
        case UPDATE_USAGE:
            const {usagePlanId, ...rest}=action.value
            return updateCatalog(usagePlanId, rest, state)
        case ADD_SUBSCRIPTION:
            return updateCatalog(action.value, {isSubscribed:true}, state)
        case DELETE_SUBSCRIPTION:
            return updateCatalog(action.value, {isSubscribed:false}, state)
        default:
            return state
    }
}