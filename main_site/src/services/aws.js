import AWS from 'aws-sdk'
export const awsRegion = 'us-east-1'
export const cognitoRegion = 'us-east-1'
export const cognitoUserPoolId = 'us-east-1_qwzk03pIC'
export const cognitoIdentityPoolId = 'us-east-1:c0a7cbb6-a5d1-4424-86ff-5480ad31a6ce'
export const cognitoClientId = '5quhuid7bivo8mioqnjohr94nd'
export const serviceName='execute-api'
export const url='https://f82n209nk8.execute-api.us-east-1.amazonaws.com/prod'
AWS.config.region = cognitoRegion

const getDate=()=>new Date().toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[:\-]|\.\d{3}/g, '')

const buildCredentialScope=(date, region, service)=>{
    return `${date.substr(0, 8)}/${region}/${service}/aws4_request`
}

//const AWS_SHA_256 = 'AWS4-HMAC-SHA256'
const AWS4_REQUEST = 'aws4_request'
const AWS4 = 'AWS4'

const calculateSigningKey=(secretKey, datetime, region, service)=>{
    return hmac(hmac(hmac(hmac(AWS4 + secretKey, datetime.substr(0, 8)), region), service), AWS4_REQUEST);
}
//headers[X_AMZ_DATE] = datetime
//simply pass state.auth to this function to get the headers
export const getHeaders=({apiKey, accessKeyId, secretAccessKey, sessionToken})=>{
    const date=getDate()
    const credentialScope=buildCredentialScope(date, awsRegion, serviceName)
    return {
        'x-api-key':apiKey,
        'Content-Type':'application/json',
        'Accept':'application/json',
        accessKey: accessKeyId,
        secretKey: secretAccessKey,
        'x-amz-security-token': sessionToken,
        'x-amz-date':date,
        'Authorization':`AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${buildCanonicalSignedHeaders(headers)}, Signature=${signature}`,
        region: awsRegion
    }
}