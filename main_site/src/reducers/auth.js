import {
    LOGOUT,
    UPDATE_API_KEY,
    UPDATE_AWS_CLIENT, 
    LOGIN_ERROR
} from '../actions/constants'

export default (state={}, action)=>{
    switch(action.type){
        case UPDATE_API_KEY:
            return {
                ...state,
                apiKey:action.value
            }
        case UPDATE_AWS_CLIENT:
            return {...state, isSignedIn:true, cognitoUser:action.user, error:null}
        case LOGIN_ERROR:
            return {...state, error:action.value}
        case LOGOUT:
            return {}
        default:
            return state
    }
}