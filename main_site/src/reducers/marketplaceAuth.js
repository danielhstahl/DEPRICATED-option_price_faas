import {
    LOGOUT
} from '../actions/constants'
import queryString from 'query-string'
//works because querystring is ONLY going to be used from redirects from amazon marketplace
const auth=queryString.parse(location.search)
export default (state=auth, action)=>{
    switch(action.type){
        case LOGOUT:
            return {}
        default:
            return state
    }
}