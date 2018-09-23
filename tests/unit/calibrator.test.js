const handler=require('../../lambda/calibrator')
const parse = require('csv-parse')
const parser=parse({
    delimiter:',', 
    cast:true, cast_date:true,
    columns:true
})
const spline=require('cubic-spline')
const fs=require('fs')
const yieldCurve=require('./yield_curve.json')
const asOfDate=Date.parse('2018-09-21')
const asset=217.66
const getIntegerArrayBetweenToPoints=(min, max)=>{
    let arr=[]
    for(let i=min; i<=max; ++i){
      arr.push(i)
    }
    return arr
}
const yearsToMuturityForSpline=getIntegerArrayBetweenToPoints(0, 30)

const ratioForUnixAndJSTimeStamp=1000

const numMSInYears=24*60*60*365*ratioForUnixAndJSTimeStamp

const getPriceFromBidAsk=({bid, ask})=>(bid+ask)*.5
const getAnnualCurve=data=>data.dataset.data[0]
const zeroCurveAtMaturities=(maturitiesInYears, annualCurve)=>{
    annualCurve[0]=0
    const updateAnnualCurve=annualCurve
        .map(
            (v, index)=>v*yearsToMuturityForSpline[index]
        )
    return maturitiesInYears.map(
        maturityInYears=>spline(
            maturityInYears, 
            yearsToMuturityForSpline, 
            updateAnnualCurve
        )/maturityInYears
    )
}
const convertPercentToNumber=val=>val*.01
const convertPercentagesToNumber=vals=>vals.map(convertPercentToNumber)

const createEvent=(data, parameters, queryStringParameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters,
    queryStringParameters
})

it('correctly calls calibrator handler for full model', (done)=>{
    const annualCurve=convertPercentagesToNumber(getAnnualCurve(yieldCurve))
    const input=fs.createReadStream('./tests/unit/apploptions.csv')
    let results=[]
    input.pipe(parser).on('data', row=>{
        const updateRow={...row, spread:row.ask-row.bid, price:getPriceFromBidAsk(row)}
        results.push(updateRow)
    }).on('end', ()=>{
        console.log(results)
        const bestOptions=results.reduce((aggr, {maturity, strike, price, spread})=>{
            const maturityInt=maturity.getTime()
            if(!aggr[maturityInt]){
                return {
                    ...aggr,
                    [maturityInt]:{
                        [strike]:{
                            price,
                            spread
                        }
                    }
                }
            }
            else if(!aggr[maturityInt][strike]||aggr[maturityInt][strike].spread>spread){
                return {
                    ...aggr,
                    [maturityInt]:{
                        ...aggr[maturityInt],
                        [strike]:{
                            price,
                            spread
                        }
                    }
                }
            }
            return aggr
        }, {})
        const maturities=Object.keys(bestOptions).filter((_v, i)=>i>0) //ignore the first one which is super close
        const maturitiesInYears=maturities.map(maturity=>(new Date(parseInt(maturity))-asOfDate)/numMSInYears)
        console.log(maturitiesInYears)
        const zeroCurve=zeroCurveAtMaturities(maturitiesInYears, annualCurve)
        const prettyResults=maturities.reduce((aggr, maturity, index)=>{
            const priceAndStrike=Object.keys(bestOptions[maturity]).map(strike=>({
                strike:parseFloat(strike),
                price:bestOptions[maturity][strike].price
            }))
            return [...aggr, {
                options:priceAndStrike,
                maturity:maturitiesInYears[index],
                rate:zeroCurve[index]            
            }]
        }, [])
        fs.writeFile("./tests/unit/results.json", JSON.stringify({
            options_and_rate:prettyResults,
            asset}), err=>{
            done()
        })
        //console.log(prettyResults)
        /*const event=createEvent({
            options_and_rate:prettyResults,
            asset,
            constraints:{}
        }, {model:'cgmy'})
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
        //done()
    })
    
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