import {
    UPDATE_SUBSCRIPTIONS,
    INSERT_SUBSCRIPTION,
    DELETE_SUBSCRIPTION,
} from '../actions/constants'
export default (state=[], action)=>{
    switch(action.type){
        case UPDATE_SUBSCRIPTIONS:
            return action.value
        case INSERT_SUBSCRIPTION:
            return [...state, action.value]
        case DELETE_SUBSCRIPTION:
            return state.filter(({usagePlanId})=>usagePlanId===action.value)
        default:
            return state
    }
}