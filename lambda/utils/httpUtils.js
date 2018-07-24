'use strict'
const https = require('https')
const gMsg=statusCode=>body=>({
    statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS 
      'Content-Type': 'application/json',
    },
    body
})
const errMsg=gMsg('400')
const msg=gMsg('200')
module.exports.errMsg=errMsg
module.exports.msg=msg
const transformCallback=callback=>(err, res)=>{
    if(err){
      return callback(null, errMsg(err))
    }
    return callback(null, msg(res))
}
module.exports.transformCallback=transformCallback

const httpGet=query=>new Promise((res, rej)=>{
    https.get(query, resp => {
      let data = '';
      resp.on('data', chunk => {
        data += chunk;
      })
      resp.on('end', () => {
        res(JSON.parse(data))
      })
    }).on('error', err => {
      rej(err)
    })
})

module.exports.httpGet=httpGet