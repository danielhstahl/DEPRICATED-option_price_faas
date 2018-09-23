const {spawnBinary} = require('./utils/spawnUtils')
const {transformCallback, errMsg} = require('./utils/httpUtils')
const {calibratorKeys} =require('./constants/keys')

const calibrator=spawnBinary('calibrator')

module.exports.calibrator=(event, _context, callback)=>{
    const {model}=event.pathParameters
    calibrator(
        calibratorKeys[model], 
        event.body, 
        transformCallback(callback)
    )
}
