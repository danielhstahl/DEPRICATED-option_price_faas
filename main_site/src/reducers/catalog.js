import {
    UPDATE_CATALOG, UPDATE_USAGE
} from '../actions/constants'

const defaultState={
    free:{quota:{period:'month'}},
    paid:{quota:{period:'month'}}
}
export const keys=Object.keys(defaultState)
export default (state=defaultState, action)=>{
    switch(action.type){
        case UPDATE_CATALOG:
            return action.value
        case UPDATE_USAGE:
            const {usagePlanId, ...rest}=action.value
            return keys.reduce((aggr, key)=>state[key].id===usagePlanId?{...aggr, [key]:{...aggr[key], ...rest}}:aggr, state)
        default:
            return state
    }
}