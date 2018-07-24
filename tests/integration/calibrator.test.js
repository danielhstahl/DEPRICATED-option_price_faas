const handler=require('../../lambda/calibrator')
const handlerCalc=require('../../lambda/pricer')

const createEvent=(data, parameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters
})
const getMSSinceStart=hrTimeArray=>hrTimeArray[0]*1000+hrTimeArray[1]/1000000;
it('calls calibrator handler and finishes in under 20 seconds', (done)=>{
    const parameters={
        "numU":8,
        "r":0.003,
        "T":1,
        "S0":178.46,
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
        "k":[95,130,150,160,165,170,175,185,190,195,200,210,240,250],
        "prices":[85,51.5,35.38,28.3,25.2,22.27,19.45,14.77,12.75,11,9.35,6.9,2.55,1.88]
    }
    console.time("calibrator")
    let start=process.hrtime()
    const event=createEvent(parameters, {calibration:'calibrate'})
    handler.calibrator(event, {}, (err, val)=>{
        console.log(val.body)
        const twentySeconds=20000
        expect(getMSSinceStart(process.hrtime(start))).toBeLessThan(twentySeconds)
        const parsedVal=JSON.parse(val.body).optimalParameters
        expect(parsedVal.sigma).toBeDefined()
        expect(parsedVal.speed).toBeDefined()
        expect(parsedVal.adaV).toBeDefined()
        expect(parsedVal.rho).toBeDefined()
        console.timeEnd("calibrator")
        done()
    })
}, 100000)


it('correctly calls calibrator handler and matches call prices with fake data', (done)=>{
    const parameters={
        numU:8,
        r:.03,
        T:1.0,
        S0:178.46,
        sigma:.2, 
        lambda:.5,
        muJ:-.05,
        sigJ:.1,
        speed:.3,
        v0:.9,
        adaV:.2,
        rho:-.5,
        k:[95,130,150,160,165,170,175,185,190,195,200,210,240,250],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        algorithm:'fangoost'
    })
    return handlerCalc.calculator(event, {}, (err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        
        const calParameters={
            "numU":8,
            "r":0.003,
            "T":1,
            "S0":178.46,
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
            "k":parameters.k,
            "prices":parsedVal.filter((v, i)=>i!==0&&i!==(parsedVal.length-1)).map((v, i)=>v.value)
        }
        const event=createEvent(calParameters, {calibration:'calibrate'})
        handler.calibrator(event, {}, (err, val)=>{
            console.log(val.body)
            const calibrateVal=JSON.parse(val.body)
            const calculatorParameters={
                ...calParameters,
                ...calibrateVal
            }
            //console.log(calculatorParameters)
            const calculatorEvent=createEvent(calculatorParameters, {
                optionType:'call',
                sensitivity:'price'
            })
            return handlerCalc.calculator(calculatorEvent, {}, (err, val)=>{
                const calcVal=JSON.parse(val.body)
                const criteriaDiff=1 //less than a dollar off
                console.log(calcVal)
                
                //console.log(parameters.prices)
                const prices=calculatorParameters.prices
                console.log(prices)
                calcVal.filter((v, i)=>i!==0&&i!==(calcVal.length-1)).map((v, i)=>{
                    const diff=Math.abs(v.value-prices[i])
                    expect(diff).toBeLessThan(criteriaDiff)
                })
                
                done()
            })
        })
    })
    
    
}, 100000)