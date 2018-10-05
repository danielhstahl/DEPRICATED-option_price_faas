import AWS from 'aws-sdk'
import {url, awsRegion} from './aws'
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
import apigClientFactory from 'aws-api-gateway-client'
import {
    signUp, 
    credentialRefresh,
    authenticateUser,
    getSession
} from './helpers/promisifyAuth'
import {
    UPDATE_API_KEY,
    API_ERROR,
} from '../actions/constants'

import {
    updateSignIn,
    updateLogOut
} from '../actions/signIn'

const POOL_DATA = {
  UserPoolId: cognitoUserPoolId,
  ClientId: cognitoClientId
}

const COGNITO_LOGIN_KEY=`cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`

const updateCredentials=(token, cognitoUser, dispatch)=>{
    const Logins={
        [COGNITO_LOGIN_KEY]:token
    }
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: cognitoIdentityPoolId,
        Logins
    })
    return credentialRefresh(AWS.config.credentials)
        .then(()=>{
            const {
                accessKeyId,
                sessionToken,
                secretAccessKey
            }=AWS.config.credentials
            const apigClient=apigClientFactory.newClient({
                accessKey:accessKeyId,
                secretKey:secretAccessKey,
                sessionToken,
                region:awsRegion, 
                invokeUrl:url
            })
            return signIn(apigClient)
                .then(()=>updateSignIn(dispatch, apigClient, cognitoUser))
        })
}

export const login=dispatch=>(email, password)=>{
    const authenticationData = {
        Username: email,
        Password: password
    }
    const authDetails = new AuthenticationDetails(authenticationData)
    const userPool=new CognitoUserPool(POOL_DATA)
    const userData = {
        Username: email,
        Pool: userPool
    }
    const cognitoUser = new CognitoUser(userData)
    return authenticateUser(cognitoUser, authDetails)
        .then(result=>{
            const token=result
                .getIdToken()
                .getJwtToken()
            return updateCredentials(token, cognitoUser, dispatch)
        })
}

export const register=dispatch=>(email, password)=>{
    const userPool=new CognitoUserPool(POOL_DATA)
    return signUp(userPool, email, password)
        .then(()=>login(dispatch)(email, password))
}

export const init=dispatch=>()=>{
    const userPool = new CognitoUserPool(POOL_DATA)
    const cognitoUser = userPool.getCurrentUser()
    return cognitoUser?getSession(cognitoUser).then(session=>{
        const token=session.getIdToken().getJwtToken()
        return updateCredentials(token, cognitoUser, dispatch)
    }):Promise.resolve()
}


export const logout=dispatch=>cognitoUser=>{
    cognitoUser.signOut()
    updateLogOut(dispatch)
}

//I'm not enthused about the dispatches after showApiKey, consider refactoring
export const showApiKey=dispatch=>client=>client.invokeApi(
    {},
    '/apikey', 
    'GET',
    {}, {}
)
.then(({data:{value}}) => dispatch({
    type:UPDATE_API_KEY,
    value
}))
.catch(err=>dispatch({
    type:API_ERROR,
    err
}))

const signIn=client=>client.invokeApi(
    {},
    '/signin',
    'POST', 
    {},
    {}
)