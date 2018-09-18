const handler=require('../../lambda/pricer')

const createEvent=(data, parameters, queryStringParameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters,
    queryStringParameters
})
it('correctly calls calculator handlers', (done)=>{
    const event=createEvent({
        strikes:[40, 50, 60],
        sigma:0.4,
        maturity:5,
        rate:0.05,
        asset:50.0,
        lambda:1.5,
        mu_l:0.05,
        sig_l:0.2,
        v0:0.5,
        speed:0.5,
        eta_v:0.3,
        rho:0.4,
        num_u:8,
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
it('correctly calls calculator with iv', (done)=>{
    const event=createEvent({
        strikes:[40, 50, 60],
        sigma:0.4,
        maturity:5,
        rate:0.05,
        asset:50.0,
        lambda:1.5,
        mu_l:0.05,
        sig_l:0.2,
        v0:0.5,
        speed:0.5,
        eta_v:0.3,
        rho:0.4,
        num_u:8,
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price'
    },{
        includeImpliedVolatility:true
    })
    return handler.calculator(event, {}, (err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(Array.isArray(parsedVal)).toEqual(true)
        done()
    })
})
it('correctly calls constraints', (done)=>{
    const event=createEvent({
        strikes:[40, 50, 60],
        sigma:0.4,
        maturity:5,
        rate:0.05,
        asset:50.0,
        lambda:1.5,
        mu_l:0.05,
        sig_l:0.2,
        v0:0.5,
        speed:0.5,
        eta_v:0.3,
        rho:0.4,
        num_u:8,
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price'
    })
    handler.constraints(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.sigma).toBeDefined()
        expect(parsedVal.speed).toBeDefined()
        expect(parsedVal.eta_v).toBeDefined()
        expect(parsedVal.rho).toBeDefined()
        done()
    })
})

it('correctly calls VaR', (done)=>{


    const event=createEvent({
        strikes:[40, 50, 60],
        sigma:0.4,
        maturity:5,
        rate:0.05,
        asset:50.0,
        lambda:1.5,
        mu_l:0.05,
        sig_l:0.2,
        v0:0.5,
        speed:0.5,
        eta_v:0.3,
        rho:0.4,
        num_u:8,
        quantile:0.01
    }, {
        densityType:'riskmetric'
    })
    handler.density(event, {}, (_err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.value_at_risk).toBeDefined()
        expect(parsedVal.expected_shortfall).toBeDefined()
        done()
    })
})