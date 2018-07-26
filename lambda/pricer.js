'use strict'
const {spawnBinary, genericSpawn} = require('./utils/spawnUtils')
const {transformCallback}=require('./utils/httpUtils')
const {calculatorKeys} =require('./constants/keys')

const pricer=spawnBinary('pricer', 'pricer')
const constraints=callback=>genericSpawn('pricer', 'output_constraints', [], callback)

module.exports.calculator=(event, _context, callback)=>{
    const {optionType, sensitivity}=event.pathParameters
    const key=optionType+sensitivity
    const index=calculatorKeys[key]
    pricer(index, event.body, transformCallback(callback))
}
module.exports.density=(event, _context, callback)=>{
    const {densityType}=event.pathParameters
    pricer(calculatorKeys[densityType], event.body, transformCallback(callback))
}
module.exports.constraints=(_event, _context, callback)=>{
    constraints(transformCallback(callback))
}
module.exports.calculatorKeys=calculatorKeys