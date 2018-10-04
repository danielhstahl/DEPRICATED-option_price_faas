export const signUp=(userPool, email, password)=>new Promise((resolve, reject)=>userPool.signUp(
    email, password, 
    [], null, 
    (err, result)=>{
        if(err){
            return reject(err)
        }
        return resolve(result)
    }
))

export const credentialRefresh=credConfig=>new Promise((resolve, reject)=>credConfig.refresh(err=>{
        if(err){
            return reject(err)
        }
        return resolve()
    }
))

export const authenticateUser=(cognitoUser, authDetails)=>new Promise((resolve, reject)=>cognitoUser.authenticateUser(authDetails, {
    onSuccess: result => {
        resolve(result)
    },
    onFailure: err => {
        reject(err)
    }
}))

export const getSession=cognitoUser=>new Promise((resolve, reject)=>cognitoUser.getSession((err, session)=>{
    if(err){
        return reject(err)
    }
    return resolve(session)
}))