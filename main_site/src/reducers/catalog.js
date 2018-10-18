import {UPDATE_CATALOG} from '../actions/constants'
//import queryString from 'query-string'
//works because querystring is ONLY going to be used from redirects from amazon marketplace
//const {usagePlanId, token}=queryString.parse(location.search)


const defaultState={
    free:{quota:{period:'month'}},
    paid:{quota:{period:'month'}}
}
export const keys=Object.keys(defaultState)
export default (state=defaultState, action)=>{
    switch(action.type){
        case UPDATE_CATALOG:
            return action.value
        default:
            return state
    }
}