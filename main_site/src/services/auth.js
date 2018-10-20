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
import { registerFree, registerPaid, getSubscriptions } from './api-catalog'
import { deleteSubscriptionLocal, addSubscriptionLocal } from '../actions/subscriptions'

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
const filterSubscriptions=({paidUsagePlanId, freeUsagePlanId})=>({data})=>data.reduce((aggr, {id})=>{
    switch(id){
        case paidUsagePlanId:{
            return {...aggr, isSubscribedPaid:true}
        }
        case freeUsagePlanId:{
            return {...aggr, isSubscribedFree:true}
        }
        default:{
            return aggr
        }       
    }
}, {isSubscribedPaid:false, isSubscribedFree:false})
const conditionalRegistration=({
    paidUsagePlanId, freeUsagePlanId, 
    token, isFromMarketPlace
}, dispatch)=>client=>{
    if(!client){
        return Promise.resolve()
    }
    return getSubscriptions(client)
        .then(filterSubscriptions({
            paidUsagePlanId, freeUsagePlanId
        }))
        .then(({isSubscribedFree, isSubscribedPaid})=>{
            if(isSubscribedFree){
                addSubscriptionLocal(dispatch)(freeUsagePlanId)
            }
            if(isSubscribedPaid){
                addSubscriptionLocal(dispatch)(paidUsagePlanId)
            }
            if(isFromMarketPlace&!isSubscribedPaid){
                addSubscriptionLocal(dispatch)(paidUsagePlanId)
                deleteSubscriptionLocal(dispatch)(freeUsagePlanId)
                return registerPaid(
                    paidUsagePlanId, freeUsagePlanId, token, client
                )
            }
            else if(!isSubscribedFree) {
                addSubscriptionLocal(dispatch)(freeUsagePlanId)
                return registerFree(freeUsagePlanId, client)
            }
            else {
                return Promise.resolve()
            }
        })
}

/**Always "register" instead of logging in.  Login will just fail on already registered and then login */
export const register=dispatch=>({
    paidUsagePlanId, freeUsagePlanId, 
    token, isFromMarketPlace
})=>{
    const userPool=new CognitoUserPool(POOL_DATA)
    return (email, password)=>{
        return signUp(userPool, email, password)
            .catch(rethrowNoLoginError)
            .then(()=>login(email, password, dispatch))
            .then(conditionalRegistration({
                paidUsagePlanId, freeUsagePlanId, 
                token, isFromMarketPlace
            }, dispatch))
    }
}
export const init=dispatch=>({
    paidUsagePlanId, freeUsagePlanId, 
    token, isFromMarketPlace
})=>{
    const userPool = new CognitoUserPool(POOL_DATA)
    const cognitoUser = userPool.getCurrentUser()
    return (cognitoUser?getSession(cognitoUser).then(session=>{
        const token=session.getIdToken().getJwtToken()
        return updateCredentials(token, cognitoUser, dispatch)
    }):Promise.resolve())
    .then(conditionalRegistration({
        paidUsagePlanId, freeUsagePlanId, 
        token, isFromMarketPlace
    }, dispatch))
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