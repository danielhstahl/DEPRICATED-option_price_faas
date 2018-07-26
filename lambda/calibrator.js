const {spawnBinary} = require('./utils/spawnUtils')
const {transformCallback, errMsg} = require('./utils/httpUtils')
const {calibratorKeys} =require('./constants/keys')

const calibrator=spawnBinary('calibrator', 'calibrator')

module.exports.calibrator=(event, _context, callback)=>{
    const {calibration}=event.pathParameters
    calibrator(
        calibratorKeys[calibration], 
        event.body, 
        transformCallback(callback)
    )
}
