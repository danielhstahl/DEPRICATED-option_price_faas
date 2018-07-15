const {spawn} = require('child_process')
const model=spawn('./target/release/pricer', [2, JSON.stringify({
    k:[1, 2, 3],
    sigma:0.4,
    T:5,
    r:0.05,
    S0:50.0,
    lambda:1.5,
    muJ:5.0,
    sigJ:0.2,
    v0:0.5,
    speed:0.5,
    adaV:0.3,
    rho:0.4,
    numU:8
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