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
            return state
        default:
            return state
    }
}