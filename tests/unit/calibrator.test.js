const handler=require('../../lambda/calibrator')

let optionPrices=require('./results.json')

const createEvent=(data, parameters, queryStringParameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters,
    queryStringParameters
})

it('correctly calls calibrator handler for full model', (done)=>{
               //console.log(prettyResults)
    optionPrices.options_and_rate.forEach(v=>{
        v.options=v.options.filter(({price})=>price>0)
        v.options.sort((a, b)=>a.strike-b.strike)
    })
    const event=createEvent({
        ...optionPrices,
        constraints:{}
    }, {model:'merton_leverage'})
    handler.calibrator(event, {}, (_err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body).optimal_parameters
        expect(parsedVal.sigma).toBeDefined()
        expect(parsedVal.speed).toBeDefined()
        expect(parsedVal.eta_v).toBeDefined()
        expect(parsedVal.rho).toBeDefined()
        console.timeEnd("calibrator")
        done()
    })
        //done()
    
    
   /* console.time("calibrator")
    const event=createEvent(calibratorParams, {model:'merton_leverage'})
    handler.calibrator(event, {}, (_err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body).optimal_parameters
        expect(parsedVal.sigma).toBeDefined()
        expect(parsedVal.speed).toBeDefined()
        expect(parsedVal.eta_v).toBeDefined()
        expect(parsedVal.rho).toBeDefined()
        console.timeEnd("calibrator")
        done()
    })*/
}, 80000)

/*
it('correctly sends error  for full model', (done)=>{
    const args={
        "num_u":8,
        "rate":0.003,
        "maturity":1,
        "asset":178.46,
        "lambda":0,
        "mu_l":2.5,//missing sigJ
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
        "strikes":[95,100,130,150,160,165,170,175,185,190,195,200,210,240,250],
        "prices":[85,78.7,51.5,35.38,28.3,25.2,22.27,19.45,14.77,12.75,11,9.35,6.9,2.55,1.88]
    }
    const event=createEvent(args, {calibration:'calibrate'})
    handler.calibrator(event, {}, (_err, val)=>{
        console.log(val.body)
        const indexOfMainPanic=val.body.indexOf("'main' panicked")
        expect(indexOfMainPanic).toBeGreaterThan(0)
        done()
    })
}, 20000) //takes a while, so 20 seconds*/