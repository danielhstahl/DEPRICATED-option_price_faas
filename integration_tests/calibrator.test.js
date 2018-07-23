const {spawn} = require('child_process')
let start=process.hrtime()
const getMSSinceStart=hrTimeArray=>hrTimeArray[0]*1000+hrTimeArray[1]/1000000;
const model=spawn('./target/release/calibrator', [1, JSON.stringify({
    T:1,
    r:0.003,
    S0:178.46,
    constraints:{ //only include constraints for variables that will be calibrated
      lambda:{
        lower:0.0,
        upper:2.0
      },
      muJ:{
        lower:-1.0,
        upper:2.0
      },
      sigJ:{
        lower:0.0,
        upper:2.0
      },
      sigma:{
        lower:0.0,
        upper:1.0
      },
      v0:{
        lower:.2,
        upper:1.8
      },
      speed:{
        lower:0.0,
        upper:3.0
      },
      adaV:{
        lower:0.0,
        upper:3.0
      },
      rho:{
        lower:-1.0,
        upper:1.0
      }
    },
    /*muJ:.05,  //if not in "constraints" MUST be here or will panic
    sigJ:.3,
    sigma:.3,
    v0:.9,
    speed:.4,
    adaV:.3,
    rho:-.3,*/
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
    console.log(modelOutput)
    console.log("Time to execute program:", getMSSinceStart(process.hrtime(start)))
    if(modelErr){
      return console.log(modelErr)
    }

  //  / console.log(modelOutput)
})