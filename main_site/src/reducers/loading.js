import {
    IS_LOGGING_IN
} from '../actions/constants'
import {combineReducers} from 'redux'

const genericLoggingIn=type=>(state=false, action)=>{
    switch(action.type){
        case type:
            return action.value
        default:
            return state
    }
}

export default combineReducers({
    isLoggingIn:genericLoggingIn(IS_LOGGING_IN)
})