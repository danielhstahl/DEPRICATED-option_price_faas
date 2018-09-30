import {
    UPDATE_LOGIN_VALUES,
    UPDATE_SIGN_IN,
    LOGOUT,
    UPDATE_API_KEY,
    UPDATE_AWS_CREDENTIALS
} from '../actions/constants'

export default (state={}, action)=>{
    switch(action.type){
        case UPDATE_LOGIN_VALUES:
            const {type, ...rest}=action
            console.log(rest)
            return {...state, ...rest}
        case UPDATE_AWS_CREDENTIALS:
            console.log(action.value)
            return {
                ...state,
                ...action.value
            }
        case UPDATE_API_KEY:
            console.log(action.value)
            return {
                ...state,
                apiKey:action.value
            }
        case UPDATE_SIGN_IN:
            return {...state, isSignedIn:true}
        case LOGOUT:
            return {}
        default:
            return state
    }
}