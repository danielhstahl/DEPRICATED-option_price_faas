/*import AWS from 'aws-sdk'
export const awsRegion = 'us-east-1'
export const cognitoRegion = 'us-east-1'
export const cognitoUserPoolId = 'us-east-1_qwzk03pIC'
export const cognitoIdentityPoolId = 'us-east-1:c0a7cbb6-a5d1-4424-86ff-5480ad31a6ce'
export const cognitoClientId = '5quhuid7bivo8mioqnjohr94nd'
//export const serviceName='execute-api'
export const url='https://f82n209nk8.execute-api.us-east-1.amazonaws.com/prod'
AWS.config.region = cognitoRegion*/



import AWS from 'aws-sdk'
export const awsRegion = window.config.region
export const cognitoRegion = window.config.region
export const cognitoUserPoolId = window.config.userPoolId
export const cognitoIdentityPoolId = window.config.identityPoolId
export const cognitoClientId = window.config.userPoolClientId
export const url=`https://${window.config.restApiId}.execute-api.${awsRegion}.amazonaws.com/prod`
AWS.config.region = cognitoRegion