const handler=require('../../lambda/pricer')

const createEvent=(data, parameters, queryStringParameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters,
    queryStringParameters
})
it('correctly calls calculator handlers', (done)=>{
    const event=createEvent({
        k:[40, 50, 60],
        sigma:0.4,
        T:5,
        r:0.05,
        S0:50.0,
        lambda:1.5,
        muJ:0.05,
        sigJ:0.2,
        v0:0.5,
        speed:0.5,
        adaV:0.3,
        rho:0.4,
        numU:8,
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price'
    })
    return handler.calculator(event, {}, (err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(Array.isArray(parsedVal)).toEqual(true)
        done()
    })
})
it('correctly calls constraints', (done)=>{
    const event=createEvent({
        k:[40, 50, 60],
        sigma:0.4,
        T:5,
        r:0.05,
        S0:50.0,
        lambda:1.5,
        muJ:0.05,
        sigJ:0.2,
        v0:0.5,
        speed:0.5,
        adaV:0.3,
        rho:0.4,
        numU:8,
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price'
    })
    handler.constraints(event, {}, (err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.sigma).toBeDefined()
        expect(parsedVal.speed).toBeDefined()
        expect(parsedVal.adaV).toBeDefined()
        expect(parsedVal.rho).toBeDefined()
        done()
    })
})

it('correctly calls VaR', (done)=>{


    const event=createEvent({
        k:[40, 50, 60],
        sigma:0.4,
        T:5,
        r:0.05,
        S0:50.0,
        lambda:1.5,
        muJ:0.05,
        sigJ:0.2,
        v0:0.5,
        speed:0.5,
        adaV:0.3,
        rho:0.4,
        numU:8,
        quantile:0.01
    }, {
        densityType:'riskmetric'
    })
    handler.density(event, {}, (err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.VaR).toBeDefined()
        expect(parsedVal.ES).toBeDefined()
        done()
    })
})