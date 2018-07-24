const {spawnBinary, genericSpawn} = require('./spawnUtils')
const {transformCallback}=require('./httpUtils')
const calculatorKeys={
    putprice:0,
    putdelta:1,
    puttheta:2,
    putgamma:3,
    callprice:4,
    calldelta:5,
    calltheta:6,
    callgamma:7,
    density:8,
    riskmetric:9
}

const pricer=spawnBinary('pricer')
const defaultParameters=callback=>genericSpawn('defaultParameters', [], callback)

module.exports.calculator=(event, context, callback)=>{
    const {optionType, sensitivity}=event.pathParameters
    const key=optionType+sensitivity
    const index=calculatorKeys[key]
    calculatorSpawn(index, event.body, transformCallback(callback))
}
module.exports.density=(event, context, callback)=>{
    const {densityType}=event.pathParameters
    const key='density'+densityType
    calculatorSpawn(calculatorKeys[key], event.body, transformCallback(callback))
}
module.exports.defaultParameters=(event, context, callback)=>{
    defaultParametersSpawn(transformCallback(callback))
}
module.exports.calculatorKeys=calculatorKeys