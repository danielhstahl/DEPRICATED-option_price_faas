const {spawn} = require('child_process')

exports.handle=(e, ctx, cb)=>{
  //e["key"] gets the data, cb:(err, body)
}
const model=spawn('./target/release/pricer', [1, JSON.stringify({
    strikes:[45.0, 50.0, 55.0],
    sigma:0.4,
    maturity:5,
    rate:0.05,
    asset:50.0,
    lambda:1.5,
    mu_l:0.05,
    sig_l:0.2,
    v0:0.5,
    speed:0.5,
    eta_v:0.3,
    rho:0.4,
    num_u:8,
    quantile:0.01
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