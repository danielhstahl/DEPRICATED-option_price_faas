const {spawn} = require('child_process')
const model=spawn('./target/release/calibrator', [0, JSON.stringify({
    T:1,
    r:0.05,
    S0:178.46,
    constraints:{ //only include constraints for variables that will be calibrated
      lambda:{
        lower:0.5,
        upper:1.0
      }
    },
    k:[95,130,150,160,165,170,175,185,190,195,200,210,240,250],
    prices:[85,51.5,35.38,28.3,25.2,22.27,19.45,14.77,12.75,11,9.35,6.9,2.55,1.88]
})])
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
      return console.log(modelErr)
    }
    console.log(modelOutput)
})