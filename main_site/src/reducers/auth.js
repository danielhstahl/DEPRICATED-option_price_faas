import {
    UPDATE_SIGN_IN,
    LOGOUT,
    UPDATE_API_KEY,
    UPDATE_COGNITO_USER
} from '../actions/constants'

export default (state={}, action)=>{
    switch(action.type){
        case UPDATE_API_KEY:
            return {
                ...state,
                apiKey:action.value
            }
        case UPDATE_SIGN_IN:
            return {...state, isSignedIn:true}
        case UPDATE_COGNITO_USER:
            return {...state, cognitoUser:action.value}
        case LOGOUT:
            return {}
        default:
            return state
    }
}