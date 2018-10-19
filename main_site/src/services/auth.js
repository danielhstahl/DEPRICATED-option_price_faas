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
    updateApiKey,
    apiError
} from '../actions/signIn'
import { registerFree, registerPaid } from './api-catalog';

const POOL_DATA = {
  UserPoolId: cognitoUserPoolId,
  ClientId: cognitoClientId
}

const COGNITO_LOGIN_KEY=`cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`

const updateCredentials=(jwtToken, cognitoUser, dispatch)=>{
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
            return signIn(apigClient)
                .then(()=>{
                    updateSignIn(dispatch, apigClient, cognitoUser)
                    return apigClient
                })
        })
}

const login=(email, password, dispatch)=>{
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
            return updateCredentials(jwtToken, cognitoUser, dispatch)
        })
}

const rethrowNoLoginError=err=>{
    if(err.code!=="UsernameExistsException"){
        throw(err)
    }
}
/**Always "register" instead of logging in.  Login will just fail on already registered and then login */
export const register=dispatch=>({
    paidUsagePlanId, freeUsagePlanId, 
    token, isFromMarketPlace
})=>{
    const userPool=new CognitoUserPool(POOL_DATA)
    return (email, password)=>{
        let firstTimeRegistering=true
        return signUp(userPool, email, password)
            .catch(err=>{
                rethrowNoLoginError(err)
                firstTimeRegistering=false
            })
            .then(()=>login(email, password, dispatch))
            .then(client=>{
                if(isFromMarketPlace){
                    return registerPaid(
                        paidUsagePlanId, freeUsagePlanId, token, client
                    )
                }
                else if(firstTimeRegistering) {
                    return registerFree(freeUsagePlanId, client)
                }
                else {
                    return Promise.resolve()
                }            
            })
    }
}

export const init=dispatch=>{
    const userPool = new CognitoUserPool(POOL_DATA)
    const cognitoUser = userPool.getCurrentUser()
    return cognitoUser?getSession(cognitoUser).then(session=>{
        const token=session.getIdToken().getJwtToken()
        return updateCredentials(token, cognitoUser, dispatch)
    }):Promise.resolve()
}
export const conditionalRegistration=(client, {
    paidUsagePlanId, freeUsagePlanId, 
    token, isFromMarketPlace
})=>{
    if(client&&isFromMarketPlace){
        return registerPaid(
            paidUsagePlanId, freeUsagePlanId, token, client
        )
    }
    else {
        return Promise.resolve()
    }
}


export const logout=dispatch=>cognitoUser=>{
    cognitoUser.signOut()
    updateLogOut(dispatch)
}

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