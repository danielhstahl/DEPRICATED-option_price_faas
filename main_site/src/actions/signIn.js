import {
    UPDATE_AWS_CLIENT,
    LOGOUT,
    IS_LOGGING_IN,
    LOGIN_ERROR,
    UPDATE_API_KEY,
    API_ERROR,
    NO_LOGIN_ERROR
} from './constants'

export const updateSignIn=(dispatch, client, user)=>dispatch({
    type:UPDATE_AWS_CLIENT,
    client, user
})

export const updateLogOut=dispatch=>dispatch({type:LOGOUT})

export const loginError=dispatch=>err=>dispatch({
    type:LOGIN_ERROR,
    value:err
})
export const noLoginError=dispatch=>()=>dispatch({
    type:NO_LOGIN_ERROR
})

export const updateLoggingIn=(dispatch, value)=>dispatch({
    type:IS_LOGGING_IN,
    value
})

export const updateApiKey=(dispatch, value)=>dispatch({type:UPDATE_API_KEY, value})
export const apiError=dispatch=>err=>dispatch({type:API_ERROR, value:err})