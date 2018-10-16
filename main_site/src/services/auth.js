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
    updateSignIn,
    updateLogOut,
    repeatVisitor,
    updateApiKey,
    apiError
} from '../actions/signIn'
import { addSubscription } from './api-catalog';

const POOL_DATA = {
  UserPoolId: cognitoUserPoolId,
  ClientId: cognitoClientId
}

const COGNITO_LOGIN_KEY=`cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`

const updateCredentials=(jwtToken, cognitoUser, usagePlanId, token, dispatch)=>{
    const Logins={
        [COGNITO_LOGIN_KEY]:jwtToken
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
            /*if(token&&usagePlanId){
                removeSubscription
                addSubscription(dispatch)(usagePlanId, )
            }*/
            return signIn(apigClient)
                .then(()=>updateSignIn(dispatch, apigClient, cognitoUser))
        })
}

const login=dispatch=>(email, password, usagePlanId, token)=>{
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
            const jwtToken=result
                .getIdToken()
                .getJwtToken()
            return updateCredentials(jwtToken, cognitoUser, usagePlanId, token, dispatch)
        })
}
/**Always "register" instead of logging in.  Login will just fail on already registered and then login */
export const register=dispatch=>(usagePlanId, token)=>(email, password)=>{
    const userPool=new CognitoUserPool(POOL_DATA)
    return signUp(userPool, email, password)
        .catch(err=>{
            console.log(err)
            repeatVisitor(dispatch)
        }) //todo!! re throw any non-duplicate user error
        .then(()=>login(dispatch)(email, password, usagePlanId, token))
}

export const init=dispatch=>(usagePlanId, token)=>{
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
.then(({data:{value}}) => updateApiKey(dispatch, value))
.catch(apiError(dispatch))

const signIn=client=>client.invokeApi(
    {},
    '/signin',
    'POST', 
    {},
    {}
)