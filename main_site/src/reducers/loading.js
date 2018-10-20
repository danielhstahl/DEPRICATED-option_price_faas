import {
    IS_LOGGING_IN, 
    IS_UNREGISTERING
} from '../actions/constants'
import {combineReducers} from 'redux'

const genericLoading=type=>(state=false, action)=>{
    switch(action.type){
        case type:
            return action.value
        default:
            return state
    }
}

export default combineReducers({
    isLoggingIn:genericLoading(IS_LOGGING_IN),
    isUnRegistering:genericLoading(IS_UNREGISTERING)
})