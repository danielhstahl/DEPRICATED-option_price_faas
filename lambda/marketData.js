'use strict'
const spline=require('cubic-spline')
const {spawnBinary} = require('./utils/spawnUtils')
const {httpGet, errMsg, msg}=require('./utils/httpUtils')
const calibratorSpawn=spawnBinary('calibrator')
const {calibratorKeys} =require('./constants/keys')

const yahooUrl='https://query1.finance.yahoo.com/v7/finance/options'
const quandlUrl='https://www.quandl.com/api/v3/datasets/FED/SVENY.json'
const f500='https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/64dd3e9582b936b0352fdd826ecd3c95/constituents_json.json'

const ratioForUnixAndJSTimeStamp=1000

const numMSInYears=24*60*60*365*ratioForUnixAndJSTimeStamp

const getIntegerArrayBetweenToPoints=(min, max)=>{
  let arr=[]
  for(let i=min; i<=max; ++i){
    arr.push(i)
  }
  return arr
}

const yearsToMuturityForSpline=getIntegerArrayBetweenToPoints(0, 30)

const yearsBetweenNowAndTimestamps=timeStamps=>{
    const currDate=Date.now()
    return timeStamps.map(timeStamp=>(timeStamp*ratioForUnixAndJSTimeStamp-currDate)/numMSInYears)
}

const liquidOptionPrices=(minOpenInterest, minRelativeBidAskSpread)=>
    ({openInterest, bid, ask})=> openInterest>=minOpenInterest

const getPriceFromBidAsk=({bid, ask})=>(bid+ask)*.5

const getRelevantData=yahooData=>
    yahooData.optionChain.result[0]

const getDateQuery=date=>date?`?date=${date}`:''

const getOptionsUrl=(ticker, date)=>`${yahooUrl}/${ticker}${getDateQuery(date)}`

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

const getZeroCurveUrl=()=>`${quandlUrl}?rows=1&api_key=${process.env.QUANDL_KEY}`


const defaultMinOpenInterest=50
const defaultMaxRelativeBidAskSpread=.1
module.exports.getOptionPrices=(event, _context, callback)=>{
    const {ticker}=event.pathParameters
    const {
        minOpenInterest, 
        maxRelativeBidAskSpread
    }=(event.queryStringParameters||{})
    const filterOptions=liquidOptionPrices(
        minOpenInterest||defaultMinOpenInterest,
        maxRelativeBidAskSpread||defaultMaxRelativeBidAskSpread
    )
    Promise.all([
        httpGet(getOptionsUrl(ticker))
            .then(getRelevantData),
        httpGet(getZeroCurveUrl())
            .then(getAnnualCurve)
            .then(convertPercentagesToNumber)
    ]).then(([{expirationDates, quote}, zeroCurve])=>{
        const asset=getPriceFromBidAsk(quote)
        const maturitiesInYears=yearsBetweenNowAndTimestamps(expirationDates)
        const ratesAtMaturities=zeroCurveAtMaturities(
            maturitiesInYears, zeroCurve
        )
        Promise.all(
            expirationDates.map(maturity=>httpGet(getOptionsUrl(ticker, maturity)).then(getRelevantData))
        ).then(results=>{
            return results.reduce((aggr, {options})=>({
                ...aggr,
                [options[0].expirationDate]:options[0].calls
                    .filter(filterOptions)
                    .map(({strike, bid, ask})=>({
                        strike,
                        price:getPriceFromBidAsk({bid, ask})
                    }))
            }), {})
        }).then(optionObj=>{
            const optionsAndRate=maturitiesInYears.map((maturity, index)=>({
                maturity,
                rate:ratesAtMaturities[index],
                options:optionObj[expirationDates[index]]
            }))
            callback(null, msg(JSON.stringify({
                asset, 
                //constraints:{},
                options_and_rate:optionsAndRate
            })))
        })
    }).catch(err=>callback(null, errMsg(err.message)))
}

module.exports.getFortune500=(_event, _context, callback)=>{
    httpGet(f500)
        .then(result=>callback(null, msg(JSON.stringify(result))))
        .catch(err=>callback(null, errMsg(err.message)))
}
