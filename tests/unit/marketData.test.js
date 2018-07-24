const handler=require('../../lambda/marketData')
const createEvent=(data, parameters, queryStringParameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters,
    queryStringParameters
})
it('correctly handles expiration dates', done=>{
    const event=createEvent({}, {ticker:'AAPL'}, {})
    handler.getExpirationDates(event, {}, (err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.S0).toBeDefined()
        expect(parsedVal.expirationDates).toBeDefined()
        done()
    })
})

it('correctly handles optionPrices', done=>{
    const event=createEvent({}, {ticker:'AAPL'}, {})
    handler.getExpirationDates(event, {}, (err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.S0).toBeDefined()
        expect(parsedVal.expirationDates).toBeDefined()
        const nM=parsedVal.expirationDates.length-1
       // console.log(parsedVal)
        const event=createEvent(
            {}, 
            {
                ticker:'AAPL', 
                asOfDate:parsedVal.expirationDates[nM]
            }, 
            {}
        )
        handler.getOptionPrices(event, {}, (err, val)=>{
            console.log(val.body)
            const parsedVal=JSON.parse(val.body)
            expect(parsedVal.S0).toBeDefined()
            expect(parsedVal.k).toBeDefined()
            expect(parsedVal.T).toBeDefined()
            done()
        })
    })  
})

it('correctly handles optionPrices with new query params', done=>{
    const event=createEvent({}, {ticker:'AAPL'}, {})
    handler.getExpirationDates(event, {}, (err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.S0).toBeDefined()
        expect(parsedVal.expirationDates).toBeDefined()
        const nM=parsedVal.expirationDates.length-1
        const event=createEvent(
            {}, 
            {
                ticker:'AAPL', 
                asOfDate:parsedVal.expirationDates[nM]
            }, 
            {
                minOpenInterest:200
            }
        )
        handler.getOptionPrices(event, {}, (err, val)=>{
            console.log(val.body)
            const parsedVal=JSON.parse(val.body)
            expect(parsedVal.S0).toBeDefined()
            expect(parsedVal.k).toBeDefined()
            expect(parsedVal.T).toBeDefined()
            done()
        })
    })
})