const {spawn} = require('child_process')
const 'release/calibrator'
process.env['PATH']=`${process.env['PATH']}:${process.env['LAMBDA_TASK_ROOT']}`
const genericSpawn=(binaryName, options, callback)=>{
    const binSubPath=`${binaryName}/release/${binaryName}`
    const binaryPath=process.env['LAMBDA_TASK_ROOT']?`${__dirname}/${binSubPath}`:`./functions/${binSubPath}`
    const model=spawn(binaryPath,options)
    let modelOutput=''
    let modelErr=''
    model.stdout.on('data', data=>{
      modelOutput+=data
    })
    model.stderr.on('data', data=>{
      modelErr+=data
    })
    model.on('close', code=>{
      if(modelErr){
        return callback(modelErr, null)
      }
      return callback(null, modelOutput)
    })
  }
  const getParametersOrObject=parameters=>parameters||"{}"
  module.exports.spawnBinary=binary=>(functionalityIndicator, parms, callback)=>{
    genericSpawn(binary, [functionalityIndicator,getParametersOrObject(parms)], callback)
  }
  module.exports.genericSpawn=genericSpawn