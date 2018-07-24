const {spawnBinary} = require('./utils/spawnUtils')
const {transformCallback, errMsg} = require('./utils/httpUtils')
const {calibratorKeys} =require('./constants/keys')

const calibratorRequiredKeys=body=>{
    const totalKey=Object.assign({}, body, body.variable)
    return totalKeys.find(key=>totalKey[key]===undefined)
}
const calibrator=spawnBinary('calibrator', 'calibrator')

module.exports.calibrator=(event, context, callback)=>{
    const {calibration}=event.pathParameters
    calibrator(
        calibratorKeys[calibration], 
        event.body, 
        transformCallback(callback)
    )
}
