/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
/*const {
  createApiKey, 
  getApiKeyForCustomer,
  getUsagePlansForCustomer,
  subscribe,
  unsubscribe,
  updateMarketPlaceCustomer,
  updateCustomerMarketplaceId
} = require('../utils')*/

const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')
const path='/keys'
AWS.config.update({ region: process.env.TABLE_REGION })
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const apigateway = new AWS.APIGateway()

let tableName = "apikeytable";


const dynamoDbGet=params=>new Promise((res, rej)=>{
  dynamoDb.get(params, (err, data)=>{
      if(err){
          return rej(err)
      }
      return res(data)
  })
})
const dynamoDbPutItem=params=>new Promise((res, rej)=>{
  dynamoDb.putItem(params, (err, data)=>{
      if(err){
          return rej(err)
      }
      return res(data)
  })
})
const dynamoDbUpdate=params=>new Promise((res, rej)=>{
  dynamoDb.update(params, err => {
      if(err){
          return rej(err)
      }
      return res()
  })
})

const apiGatewayCreateApiKey=params=>new Promise((resolve, reject)=>{
  apigateway.createApiKey(params, (err, data)=>{
      if(err){
          return reject(err)
      }
      resolve(data)
  })
})
const apiGatewayGetApiKeys=params=>new Promise((resolve, reject)=>{
  apigateway.getApiKeys(params, (err, data)=>{
      if(err){
          return reject(err)
      }
      resolve(data)
  })
})
const apiGatewayGetUsagePlans=params=>new Promise((res, rej)=>{
  apigateway.getUsagePlans(params, (err, data) => {
      if (err) {
          return rej(err)
      }
      return res(data)
  })
})
const apiGatewayCreateUsagePlanKey=params=>new Promise((res, rej)=>{
  apigateway.createUsagePlanKey(params, (err, data) => {
      if (err) {
          return rej(err)
      }
      return res(data)
  })
})
const apiGatewayDeleteUsagePlan=params=>new Promise((res, rej)=>{
  apigateway.deleteUsagePlan(params, (err, data) => {
      if (err) {
          return rej(err)
      }
      return res(data)
  })
})
const apiGatewayUpdateApiKey=params=>new Promise((res, rej)=>{
  apigateway.updateApiKey(params, function(err, data) {
      if (err) {
          return rej(err)
      }
      return res(data)
  })
})
const marketplaceResolveCustomer=params=>new Promise((res, rej)=>{
  const marketplace = new AWS.MarketplaceMetering()
  marketplace.resolveCustomer(params, (err, data)=>{
      if(err){
          return rej(err)
      }
      return res(data)
  })
})
/**end promisify */

module.exports.writeApiKey=(cognitoIdentityId, keyId)=>{
  const customerId = cognitoIdentityId// + '+' + keyId

  // ensure user is tracked in customer table
  const getParams = {
      TableName: tableName,
      Key: {
          Id: customerId
      }
  }
  return dynamoDbGet(getParams)
      .then(data=>{
          if(data.Item===undefined){
              const putParams = {
                  TableName: tableName,
                  Item: {
                      Id: customerId,
                      ApiKeyId: keyId
                  }
              }
              return dynamoDbPutItem(putParams)
          }
          else{
              return DataCue.Item
          }
      })
}


module.exports.subscribe=(cognitoIdentityId, usagePlanId)=>{
  return getApiKeyForCustomer(cognitoIdentityId)
      .then(data=>{
          if (data.items.length === 0) {
              return createApiKey(cognitoIdentityId)
          }
          else {
              return data.items[0]
          }
      })
      .then(({id})=>createUsagePlanKey(id, usagePlanId))
}

module.exports.unsubscribe=(cognitoIdentityId, usagePlanId)=>{
  return getApiKeyForCustomer(cognitoIdentityId)
      .then(data=>{
          if (data.items.length === 0) {
              throw('Customer does not have an API Key')
          }
          else{
              const keyId = data.items[0].id
              return deleteUsagePlanKey(keyId, usagePlanId)
          }
      })
}


//cognitoIdentityId is the customer
//returns promise
const createApiKey=cognitoIdentityId=>{
  // set the name to the cognito identity ID so we can query API Key for the cognito identity
  const params = {
      description: `Dev Portal API Key for ${cognitoIdentityId}`,
      enabled: true,
      generateDistinctId: true,
      name: cognitoIdentityId
  }
  return apiGatewayCreateApiKey(params)
      .then(data=>updateCustomerApiKeyId(
          cognitoIdentityId, data.id
      ))
}
module.exports.createApiKey=createApiKey

const createUsagePlanKey=(keyId, usagePlanId)=>{
  //console.log(`Creating usage plan key for key id ${keyId} and usagePlanId ${usagePlanId}`)

  const params = {
      keyId,
      keyType: 'API_KEY',
      usagePlanId
  }
  return apiGatewayCreateUsagePlanKey(params)
}

const deleteUsagePlanKey=(keyId, usagePlanId)=>{
  const params = {
      keyId,
      usagePlanId
  }
  return apiGatewayDeleteUsagePlan(params)
}

const getApiKeyForCustomer=cognitoIdentityId=> {
  //console.log(`Getting API Key for customer  ${cognitoIdentityId}`)
  const params = {
      limit: 1,
      includeValues: true,
      nameQuery: cognitoIdentityId
  }
  return apiGatewayGetApiKeys(params)
}
module.exports.getApiKeyForCustomer=getApiKeyForCustomer

module.exports.getUsagePlansForCustomer=cognitoIdentityId=> {
  //console.log(`Getting API Key for customer ${cognitoIdentityId}`)
  return getApiKeyForCustomer(cognitoIdentityId)
      .then(data=>{
          if (data.items.length === 0) {
              return {data : {}}
          }
          else {
              const keyId = data.items[0].id
              const params = {
                  keyId,
                  limit: 1000
              }
              return apiGatewayGetUsagePlans(params)
          }
      })
}

module.exports.updateCustomerMarketplaceId=(
  cognitoIdentityId, marketplaceCustomerId
)=>{
  const dynamoDbParams = {
      TableName: tableName,
      Key: {
          Id: cognitoIdentityId
      },
      UpdateExpression: 'set #a = :x',
      ExpressionAttributeNames: { '#a': 'MarketplaceCustomerId' },
      ExpressionAttributeValues: {
          ':x': marketplaceCustomerId
      }
  }
  // update DDB customer record with marketplace customer id
  // and update API Gateway API Key with marketplace customer id
  return dynamoDbUpdate(dynamoDbParams)
      .then(()=>{
          return getApiKeyForCustomer(cognitoIdentityId)
      })
      .then(data=>{
          if(data.items.length===0){
              return createApiKey(cognitoIdentityId)
          }
          else{
              return data.items[0]
          }
      })
      .then(data=>updateApiKey(
          data.id, marketplaceCustomerId
      ))
}

module.exports.updateMarketPlaceCustomer=marketplaceToken=>{
  const params = {
      RegistrationToken: marketplaceToken
  }
  return marketplaceResolveCustomer(params)
}


//apiKeyId is the api key, I think
const updateApiKey=(apiKeyId, marketplaceCustomerId)=>{
  // update API Gateway API Key with marketplace customer id to support metering
  var params = {
      apiKey: apiKeyId,
      patchOperations: [
          {
              op: 'replace',
              path: '/customerId', //https://docs.aws.amazon.com/apigateway/api-reference/link-relation/apikey-update/
              value: marketplaceCustomerId
          }
      ]
  }
  return apiGatewayUpdateApiKey(params)
}


const updateCustomerApiKeyId=(cognitoIdentityId, apiKeyId)=>{
  // update customer record with marketplace customer code
  const dynamoDbParams = {
      TableName: tableName,
      Key: {
          Id: cognitoIdentityId
      },
      UpdateExpression: 'set #a = :x',
      ExpressionAttributeNames: { '#a': 'ApiKeyId' },
      ExpressionAttributeValues: {
          ':x': apiKeyId
      }
  }
  return dynamoDbUpdate(dynamoDbParams)
}




const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "Id";
const partitionKeyType = "S";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/keys";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';
// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

// convert url string param to expected Type


const getCognitoIdentityId=req=>{
  return req.apiGateway.event.requestContext.identity.cognitoIdentityId
}


const errFunc=res=>data=>{
  res.status(500).json(data)
}
app.get(path+'/apikey', (req, res)=>{
  const cognitoId=getCognitoIdentityId(req)
  getApiKeyForCustomer(cognitoId).then(data=>{
    if (data.items.length === 0) {
      res.status(404).json('No API Key for customer')
    } 
    else {
      const item = data.items[0]
      const key = {
          id: item.id,
          value: item.value
      }
      res.status(200).json(key)
    }
  }).catch(errFunc(res))
})

app.get(path+'/subscriptions', (req, res)=>{
  const cognitoId=getCognitoIdentityId(req)
  getUsagePlansForCustomer(cognitoId).then(data=>{
      res.status(200).json(data.items)
  }).catch(errFunc(res))
})

app.put(path+'/subscriptions/:usagePlanId', (req, res)=>{
  const cognitoId=getCognitoIdentityId(req)
  const {usagePlanId} = req.params
  subscribe(cognitoId, usagePlanId).then(data=>{
      res.status(200).json(data.items)
  }).catch(errFunc(res))
})

app.delete(path+'/subscriptions/:usagePlanId', (req, res)=>{
  const cognitoId=getCognitoIdentityId(req)
  const {usagePlanId} = req.params
  unsubscribe(cognitoId, usagePlanId).then(data=>{
      res.status(200).json(data.items)
  }).catch(errFunc(res))
})

app.put(path+'/marketplace/:usagePlanId', (req, res)=>{
  const cognitoId=getCognitoIdentityId(req)
  const {token} = req.body
  const {usagePlanId} = req.params
  updateMarketPlaceCustomer(token)
    .then(({CustomerIdentifier:marketplaceCustomerId})=>{
        return updateCustomerMarketplaceId(
            cognitoId,
            marketplaceCustomerId
        )
    })
    .then(()=>subscribe(cognitoId, usagePlanId))
    .catch(errFunc(res))
})

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
