import {
    UPDATE_AWS_CLIENT,
    LOGOUT,
    IS_LOGGING_IN,
    LOGIN_ERROR
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

export const updateLoggingIn=(dispatch, value)=>dispatch({
    type:IS_LOGGING_IN,
    value
})