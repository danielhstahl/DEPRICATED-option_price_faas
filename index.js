const {getOptionPrices}=require('./lambda/marketData')
getOptionPrices({pathParameters:{ticker:'AAPL'}}, null, (_, res)=>{
    console.log(res)
})