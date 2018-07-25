const {spawn} = require('child_process')
let start=process.hrtime()
const getMSSinceStart=hrTimeArray=>hrTimeArray[0]*1000+hrTimeArray[1]/1000000

const calibratorParams={
  "numU":8,
  "rate":0.003,
  "maturity":1,
  "asset":178.46,
  "lambda":0,
  "mu_l":2.5,
  "sig_l":0.3,
  "constraints":{
      "sigma": {
          "upper":2.0,
          "lower":0.0
      },
      "v0":{
          "upper":1.8,
          "lower":0.2
      },
      "speed":{
          "upper":3.0,
          "lower":0.0
      },
      "eta_v":{
          "upper":3.0,
          "lower":0.0
      },
      "rho":{
          "upper":1.0,
          "lower":-1.0
      }
  },
  "strikes":[95,130,150,160,165,170,175,185,190,195,200,210,240,250],
  "prices":[85,51.5,35.38,28.3,25.2,22.27,19.45,14.77,12.75,11,9.35,6.9,2.55,1.88]
}
const model=spawn('./target/release/calibrator', [1, JSON.stringify(calibratorParams)])
let modelOutput=''
let modelErr=''
model.stdout.on('data', data=>{
    modelOutput+=data
  })
  model.stderr.on('data', data=>{
    modelErr+=data
  })
  model.on('close', code=>{
    console.log(modelOutput)
    console.log("Time to execute program:", getMSSinceStart(process.hrtime(start)))
    if(modelErr){
      return console.log(modelErr)
    }
})