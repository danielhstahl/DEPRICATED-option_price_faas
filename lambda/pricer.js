'use strict'
const {spawnBinary, genericSpawn} = require('./utils/spawnUtils')
const {transformCallback}=require('./utils/httpUtils')
const {calculatorKeys} =require('./constants/keys')

//const pricer=spawnBinary('pricer')
const constraints=callback=>genericSpawn('output_constraints', [], callback)

module.exports.calculator=(event, _context, callback)=>{
    const {optionType, sensitivity}=event.pathParameters
    const key=optionType+sensitivity
    const index=calculatorKeys[key]
    const {includeImpliedVolatility:iv}=(event.queryStringParameters||{})
    let includeIV=iv==='true'?1:0
    genericSpawn('pricer', [index, event.body, includeIV], transformCallback(callback))
    //pricer(index, event.body, transformCallback(callback))
}
module.exports.density=(event, _context, callback)=>{
    const {densityType}=event.pathParameters
    genericSpawn('pricer', [densityType, event.body], transformCallback(callback))
}
module.exports.constraints=(_event, _context, callback)=>{
    constraints(transformCallback(callback))
}
module.exports.calculatorKeys=calculatorKeys