import AWS from 'aws-sdk'
import {url, getHeaders} from './aws'
import { 
    CognitoUserPool, 
    CognitoUser, 
    AuthenticationDetails 
} from 'amazon-cognito-identity-js'
import { 
    cognitoIdentityPoolId, 
    cognitoUserPoolId, 
    cognitoClientId, 
    cognitoRegion 
} from './aws'

import {
    UPDATE_LOGIN_VALUES,
    UPDATE_AWS_CREDENTIALS,
    LOGIN_ERROR,
    UPDATE_API_KEY,
    API_ERROR,
    REGISTER_ERROR,
    LOGOUT,
    UPDATE_SIGN_IN,
    SIGN_IN_ERROR
} from '../actions/constants'

const POOL_DATA = {
  UserPoolId: cognitoUserPoolId,
  ClientId: cognitoClientId
}

const COGNITO_LOGIN_KEY=`cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`

export const register=dispatch=>(email, password)=>{
    const userPool=new CognitoUserPool(POOL_DATA)
    userPool.signUp(
        email, password, 
        [], null, 
        (err, result) => {
            
            if (err) {
                console.log(err)
                dispatch({
                    type:REGISTER_ERROR,
                    err
                })
            } else {
                console.log(result)
                login(dispatch)(email, password)
            }
        }
    )
}

export const login=dispatch=>(email, password)=>{
    const authenticationData = {
        Username: email,
        Password: password
    }
    const authDets = new AuthenticationDetails(authenticationData)
    const userPool=new CognitoUserPool(POOL_DATA)
    const userData = {
        Username: email,
        Pool: userPool
    }
    const cognitoUser = new CognitoUser(userData)
    cognitoUser.authenticateUser(authDets, {
        onSuccess: result => {
            console.log(result)
            const token=result
                .getIdToken()
                .getJwtToken()
            const Logins={
                [COGNITO_LOGIN_KEY]:token
            }
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: cognitoIdentityPoolId,
                Logins
            })
            AWS.config.credentials.refresh(err=>{
                if(err){
                    return dispatch({
                        type:LOGIN_ERROR,
                        err
                    })
                }
                
                dispatch({
                    type:UPDATE_AWS_CREDENTIALS,
                    value:AWS.config.credentials
                })
                signIn(dispatch)(getHeaders(AWS.config.credentials))
            })
        },
        onFailure: err => {
            console.log(err)
            return dispatch({
                type:LOGIN_ERROR,
                err
            })
        }
    })
}


export const logout=dispatch=>()=>dispatch({
    type:LOGOUT
})

export const showApiKey=dispatch=>headers=>fetch(
    `${url}/apikey`, {headers}
)
.then(({data}) => dispatch({
    type:UPDATE_API_KEY,
    value:data.value
}))
.catch(err=>dispatch({
    type:API_ERROR,
    err
}))

export const signIn=dispatch=>headers=>fetch(
    `${url}/signin`, {headers, type:'POST'}
)
.then(({data}) => dispatch({
    type:UPDATE_SIGN_IN,
    value:data
}))
.catch(err=>dispatch({
    type:SIGN_IN_ERROR,
    err
}))