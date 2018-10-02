import {
    //UPDATE_LOGIN_VALUES,
    UPDATE_SIGN_IN,
    LOGOUT,
    UPDATE_API_KEY,
    //UPDATE_AWS_CREDENTIALS
} from '../actions/constants'

export default (state={}, action)=>{
    switch(action.type){
        case UPDATE_API_KEY:
            return {
                ...state,
                apiKey:action.value
            }
        case UPDATE_SIGN_IN:
            console.log(action.value)
            return {...state, isSignedIn:true}
        case LOGOUT:
            return {}
        default:
            return state
    }
}