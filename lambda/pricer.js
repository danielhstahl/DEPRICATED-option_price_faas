'use strict'
const {genericSpawn} = require('./utils/spawnUtils')
const {transformCallback}=require('./utils/httpUtils')
const calculatorKeys =require('./constants/keys')

module.exports.calculator=(event, _context, callback)=>{
    const {optionType, sensitivity, model}=event.pathParameters
    const key=optionType+sensitivity
    const function_choice=calculatorKeys[key]
    const cf_choice=calculatorKeys[model]
    const {includeImpliedVolatility:iv}=(event.queryStringParameters||{})
    let includeIV=iv===true?1:0
    genericSpawn('pricer', [
        function_choice, includeIV, 
        cf_choice, event.body
    ], transformCallback(callback))
}
module.exports.density=(event, _context, callback)=>{
    const {densityType, model}=event.pathParameters
    const function_choice=calculatorKeys[densityType]
    const cf_choice=calculatorKeys[model]
    genericSpawn(
        'pricer', 
        [function_choice, 0, cf_choice, event.body], 
        transformCallback(callback)
    )
}
module.exports.constraints=(event, _context, callback)=>{
    const {model}=event.pathParameters
    const cf_choice=calculatorKeys[model]
    genericSpawn(
        'output_constraints', 
        [cf_choice], 
        transformCallback(callback)
    )
}
module.exports.calculatorKeys=calculatorKeys