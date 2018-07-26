const handler=require('../../lambda/calibrator')
const handlerCalc=require('../../lambda/pricer')

const createEvent=(data, parameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters
})
const getMSSinceStart=hrTimeArray=>hrTimeArray[0]*1000+hrTimeArray[1]/1000000;
it('calls calibrator handler and finishes in under 20 seconds', (done)=>{
    const parameters={
        "num_u":8,
        "rate":0.003,
        "maturity":1,
        "asset":178.46,
        constraints:{ //only include constraints for variables that will be calibrated
          lambda:{
            lower:0.0,
            upper:2.0
          },
          mu_l:{
            lower:-1.0,
            upper:2.0
          },
          sig_l:{
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
          eta_v:{
            lower:0.0,
            upper:3.0
          },
          rho:{
            lower:-1.0,
            upper:1.0
          }
        },
        "strikes":[95,130,150,160,165,170,175,185,190,195,200,210,240,250],
        "prices":[85,51.5,35.38,28.3,25.2,22.27,19.45,14.77,12.75,11,9.35,6.9,2.55,1.88]
    }
    console.time("calibrator")
    let start=process.hrtime()
    const event=createEvent(parameters, {calibration:'calibrate'})
    handler.calibrator(event, {}, (_err, val)=>{
        console.log(val.body)
        const twentySeconds=20000
        expect(getMSSinceStart(process.hrtime(start))).toBeLessThan(twentySeconds)
        const parsedVal=JSON.parse(val.body).optimalParameters
        expect(parsedVal.sigma).toBeDefined()
        expect(parsedVal.speed).toBeDefined()
        expect(parsedVal.eta_v).toBeDefined()
        expect(parsedVal.rho).toBeDefined()
        console.timeEnd("calibrator")
        done()
    })
}, 100000)


it('correctly calls calibrator handler and matches call prices with fake data', (done)=>{
    const constParams={
      num_u:8,
      rate:.03,
      maturity:1.0,
      asset:178.46,
      strikes:[95,130,150,160,165,170,175,185,190,195,200,210,240,250],
      quantile:0.01
    }
    const parameters={
        ...constParams,
        sigma:.2, 
        lambda:.5,
        mu_l:-.05,
        sig_l:.1,
        speed:.3,
        v0:.9,
        eta_v:.2,
        rho:-.5
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        algorithm:'fangoost'
    })
    /**Finds the prices */
    return handlerCalc.calculator(event, {}, (_err, val)=>{
        //console.log(val.body)
        const parsedVal=JSON.parse(val.body).map(({value})=>value)
        
        const calParameters={
           ...constParams,
            constraints:{ //only include constraints for variables that will be calibrated
              lambda:{
                lower:0.0,
                upper:2.0
              },
              mu_l:{
                lower:-1.0,
                upper:1.0
              },
              sig_l:{
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
              eta_v:{
                lower:0.0,
                upper:3.0
              },
              rho:{
                lower:-1.0,
                upper:1.0
              }
            },
            "prices":parsedVal
        }
        const event=createEvent(calParameters, {calibration:'calibrate'})
        /**calibrates the prices */
        handler.calibrator(event, {}, (_err, val)=>{
            const calibrateVal=JSON.parse(val.body)
            const calculatorParameters={
                ...constParams,
                ...calibrateVal.optimalParameters,
                prices:parsedVal
            }
            const calculatorEvent=createEvent(calculatorParameters, {
                optionType:'call',
                sensitivity:'price'
            })
            console.log(calculatorEvent)
            /**recomputes the prices to compare with the original */
            return handlerCalc.calculator(calculatorEvent, {}, (_err, val)=>{
                const calcVal=JSON.parse(val.body)
                const criteriaDiff=1 //less than a dollar off
                const prices=calculatorParameters.prices
                calcVal.map((v, i)=>{
                    const diff=Math.abs(v.value-prices[i])
                    expect(diff).toBeLessThan(criteriaDiff)
                })
                done()
            })
        })
    })
    
    
}, 100000)