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

const yearsBetweenNowAndTimestamp=timeStamp=>
    (timeStamp*ratioForUnixAndJSTimeStamp-Date.now())/numMSInYears

const liquidOptionPrices=(minOpenInterest, minRelativeBidAskSpread)=>
    ({openInterest, bid, ask})=> 
    Math.abs(bid-ask)/ask<minRelativeBidAskSpread && openInterest>=minOpenInterest

const getPriceFromBidAsk=({bid, ask})=>(bid+ask)*.5

const getRelevantData=yahooData=>
    yahooData.optionChain.result[0]

const getExpirationDates=relevantData=>({
    asset:getPriceFromBidAsk(relevantData.quote), 
    expirationDates:relevantData.expirationDates.map(v=>v*ratioForUnixAndJSTimeStamp)
})

const filterSingleMaturityData=filterLiquidFn=>
    relevantData=>{
        const asset=getPriceFromBidAsk(relevantData.quote)
        const options=relevantData.options[0].calls
            .filter(filterLiquidFn)
            .map(
                ({strike, bid, ask})=>({
                    strike,
                    price:getPriceFromBidAsk({bid, ask})
                })
            )
            .reduce((aggr, {strike, price})=>({
                strikes:[...aggr.strikes, strike],
                prices:[...aggr.prices, price]
            }), {strikes:[], prices:[]})
        return Object.assign({asset}, options)
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
module.exports.getExpirationDates=(event, _context, callback)=>{
    const {ticker}=event.pathParameters
    httpGet(getQuery(ticker)())
        .then(getRelevantData)
        .then(getExpirationDates)
        .then(data=>callback(null, msg(JSON.stringify(data))))
        .catch(err=>callback(null, errMsg(err.message)))
}
const defaultMinOpenInterest=25
const defaultMinRelativeBidAskSpread=.1

module.exports.getOptionPrices=(event, _context, callback)=>{
  const {ticker, asOfDate}=event.pathParameters
  const {minOpenInterest, minRelativeBidAskSpread}=event.queryStringParameters
  const filterOptions=liquidOptionPrices(
      minOpenInterest||defaultMinOpenInterest, 
      minRelativeBidAskSpread||defaultMinRelativeBidAskSpread
  )
  const filterSingleMaturityDataInst=filterSingleMaturityData(filterOptions)
  const yahooT=asOfDate/ratioForUnixAndJSTimeStamp
  const maturity=yearsBetweenNowAndTimestamp(yahooT)
  Promise.all([
    httpGet(getQuery(ticker)(yahooT))
      .then(getRelevantData)
      .then(filterSingleMaturityDataInst),
    getZeroCurve(maturity)
  ])
  .then(([optionData, rate])=>{
    const data={...optionData, rate, maturity, constraints:{}} //constraints are dummy
    calibratorSpawn(calibratorKeys.spline, JSON.stringify(data), (err, spline)=>{
      if(err){
        return callback(null, errMsg(err))
      }
      return callback(null, msg(JSON.stringify(Object.assign({}, data, JSON.parse(spline)))))
    })
  }).catch(err=>callback(null, errMsg(err.message)))
}

module.exports.getFortune500=(_event, _context, callback)=>{
    httpGet(f500)
        .then(result=>callback(null, msg(JSON.stringify(result))))
        .catch(err=>callback(null, errMsg(err.message)))
}
