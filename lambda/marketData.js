'use strict'
const spline=require('cubic-spline')
const {spawnBinary} = require('./utils/spawnUtils')
const {httpGet, errMsg, msg}=require('./utils/httpUtils')
const calibratorSpawn=spawnBinary('calibrator')
const {calibratorKeys} =require('./constants/keys')

const yahooUrl='https://query1.finance.yahoo.com/v7/finance/options'
const quandlUrl='https://www.quandl.com/api/v3/datasets/FED/SVENY.json'
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

const yearsBetweenNowAndTimestamp=timeStamp=>
    (timeStamp*ratioForUnixAndJSTimeStamp-Date.now())/numMSInYears

const liquidOptionPrices=(minOpenInterest, minRelativeBidAskSpread)=>
    ({openInterest, bid, ask})=> 
    Math.abs(bid-ask)/ask<minRelativeBidAskSpread && openInterest>=minOpenInterest

const getPriceFromBidAsk=({bid, ask})=>(bid+ask)*.5

const getRelevantData=yahooData=>yahooData.optionChain.result[0]

const getExpirationDates=relevantData=>({
  S0:getPriceFromBidAsk(relevantData.quote), 
  expirationDates:relevantData.expirationDates.map(v=>v*ratioForUnixAndJSTimeStamp)
})

const filterSingleMaturityData=filterLiquidFn=>relevantData=>{
  const S0=getPriceFromBidAsk(relevantData.quote)
  const options=relevantData.options[0].calls
    .filter(filterLiquidFn)
    .map(
        ({strike, bid, ask})=>({
            strike,
            price:getPriceFromBidAsk({bid, ask})
        })
    )
    .reduce((aggr, {strike, price})=>({
        k:[...aggr.k, strike],
        prices:[...aggr.prices, price]
    }), {k:[], prices:[]})
  return Object.assign({S0}, options)
}
const getDateQuery=date=>date?`?date=${date}`:''

const getQuery=ticker=>
    asOfDate=>`${yahooUrl}/${ticker}${getDateQuery(asOfDate)}`

const getAnnualCurve=data=>data.dataset.data[0]

const instantiateSpline=maturityInYears=>annualCurve=>{
    annualCurve[0]=0
    const updateAnnualCurve=annualCurve
        .map(
            (v, index)=>v*yearsToMuturityForSpline[index]
        )
    return spline(
        maturityInYears, 
        yearsToMuturityForSpline, 
        updateAnnualCurve
    )/maturityInYears
}
const convertPercentToNumber=val=>val*.01
const getZeroCurve=maturityInYears=>{
    const url=`${quandlUrl}?rows=1&api_key=${process.env.QUANDL_KEY}`
    return httpGet(url)
        .then(getAnnualCurve)
        .then(instantiateSpline(maturityInYears))
        .then(convertPercentToNumber)
}
module.exports.getExpirationDates=(event, context, callback)=>{
    const {ticker}=event.pathParameters
    httpGet(getQuery(ticker)())
        .then(getRelevantData)
        .then(getExpirationDates)
        .then(data=>callback(null, msg(JSON.stringify(data))))
        .catch(err=>callback(null, errMsg(err.message)))
}
const defaultMinOpenInterest=25
const defaultMinRelativeBidAskSpread=.1

module.exports.getOptionPrices=(event, context, callback)=>{
  const {ticker, asOfDate}=event.pathParameters
  const {minOpenInterest, minRelativeBidAskSpread}=event.queryStringParameters
  const filterOptions=liquidOptionPrices(
      minOpenInterest||defaultMinOpenInterest, 
      minRelativeBidAskSpread||defaultMinRelativeBidAskSpread
  )
  const filterSingleMaturityDataInst=filterSingleMaturityData(filterOptions)
  const yahooT=asOfDate/ratioForUnixAndJSTimeStamp
  const T=yearsBetweenNowAndTimestamp(yahooT)
  Promise.all([
    httpGet(getQuery(ticker)(yahooT))
      .then(getRelevantData)
      .then(filterSingleMaturityDataInst),
    getZeroCurve(T)
  ])
  .then(([optionData, r])=>{
    const data={...optionData, r, T}
    calibratorSpawn(calibratorKeys.spline, JSON.stringify(data), (err, spline)=>{
      if(err){
        return callback(null, errMsg(err))
      }
      return callback(null, msg(JSON.stringify(Object.assign({}, data, JSON.parse(spline)))))
    })
  }).catch(err=>callback(null, errMsg(err.message)))
}
