import AWS from 'aws-sdk'
export const awsRegion = process.env.REACT_AWSRegion
export const cognitoRegion = process.env.REACT_AWSRegion
export const cognitoUserPoolId = process.env.REACT_CognitoUserPoolId
export const cognitoIdentityPoolId = process.env.REACT_CognitoIdentityPoolId
export const cognitoClientId = process.env.REACT_CognitoUserPoolClientId
export const url=process.env.REACT_ApiUrl
AWS.config.region = cognitoRegion