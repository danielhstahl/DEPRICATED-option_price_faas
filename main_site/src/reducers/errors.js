import {
    NO_SUBSCRIPTION_ERROR,
    SUBSCRIPTION_ERROR,
    LOGIN_ERROR,
    NO_LOGIN_ERROR,
    API_ERROR,
    NO_API_ERROR
} from '../actions/constants'
import {combineReducers} from 'redux'
const genericError=(goodType, badType)=>(state=null, action)=>{
    switch(action.type){
        case goodType:
            return null
        case badType:
            return action.value
        default:
            return state
    }
}
const subscriptionError=genericError(NO_SUBSCRIPTION_ERROR, SUBSCRIPTION_ERROR)
const loginError=genericError(NO_LOGIN_ERROR, LOGIN_ERROR)
const apiError=genericError(NO_API_ERROR, API_ERROR)
export default combineReducers({
    subscriptionError,
    loginError,
    apiError
})

