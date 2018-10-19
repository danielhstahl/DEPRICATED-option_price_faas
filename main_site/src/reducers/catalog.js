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
            console.log(action.value)
            return action.value
        case UPDATE_USAGE:
            console.log(action)
            const {usagePlanId, ...rest}=action.value
            console.log(state)
            console.log(keys)
            console.log(keys.reduce((aggr, key)=>state[key].id===usagePlanId?{...aggr, ...state, [key]:{...aggr[key], ...rest}}:{...aggr, ...state}, {}))
            return keys.reduce((aggr, key)=>state[key].id===usagePlanId?{...aggr, [key]:{...aggr[key], ...rest}}:aggr, state)
        default:
            return state
    }
}