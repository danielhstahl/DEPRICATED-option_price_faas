import {
    UPDATE_SUBSCRIPTIONS,
    DELETE_SUBSCRIPTION,
} from '../actions/constants'
export default (state=[], action)=>{
    switch(action.type){
        case UPDATE_SUBSCRIPTIONS:
            console.log(action.value)
            return action.value
        case DELETE_SUBSCRIPTION:
            return state.filter(({usagePlanId})=>usagePlanId===action.value)
        default:
            return state
    }
}