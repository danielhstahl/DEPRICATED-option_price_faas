import {UPDATE_CATALOG} from '../actions/constants'
//import queryString from 'query-string'
//works because querystring is ONLY going to be used from redirects from amazon marketplace
//const {usagePlanId, token}=queryString.parse(location.search)
const containsString=(match, string)=>string.toLowerCase().includes(match)
const checkKey=keys=>name=>keys.find(key=>containsString(name, key))
const keys=["free", "paid"]
export default (state={}, action)=>{
    switch(action.type){
        case UPDATE_CATALOG:
            return action.value.reduce((aggr, curr)=>{
                const key=checkKey(keys, curr.name)
                if(key){
                    //const isMarketPlace=curr.id===usagePlanId
                    //const tokenIfMarket=isMarketPlace?{token}:{}
                    return {...aggr, [key]:curr}
                }
                else {
                    return aggr
                }
            }, {})
        default:
            return state
    }
}