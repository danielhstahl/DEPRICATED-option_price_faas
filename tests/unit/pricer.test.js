const handler=require('../../lambda/pricer')

const createEvent=(data, parameters, queryStringParameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters,
    queryStringParameters
})
it('correctly calls calculator handlers', (done)=>{
    const event=createEvent({
        strikes:[40, 50, 60],
        maturity:5,
        rate:0.05,
        asset:50.0,
        cf_parameters:{
            sigma:0.4,
            lambda:1.5,
            mu_l:0.05,
            sig_l:0.2,
            v0:0.5,
            speed:0.5,
            eta_v:0.3,
            rho:0.4,
        },        
        num_u:8,
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price',
        model:'merton'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(Array.isArray(parsedVal)).toEqual(true)
        done()
    })
})
it('correctly calls calculator with iv', (done)=>{
    const event=createEvent({
        strikes:[40, 50, 60],
        maturity:5,
        rate:0.05,
        asset:50.0,
        cf_parameters:{
            sigma:0.4,
            lambda:1.5,
            mu_l:0.05,
            sig_l:0.2,
            v0:0.5,
            speed:0.5,
            eta_v:0.3,
            rho:0.4,
        },  
        num_u:8,
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price',
        model:'merton'
    },{
        includeImpliedVolatility:true
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(Array.isArray(parsedVal)).toEqual(true)
        done()
    })
})
it('correctly calls calculator with cgmy', (done)=>{
    const event=createEvent({
        strikes:[40, 50, 60],
        maturity:5,
        rate:0.05,
        asset:50.0,
        cf_parameters:{
            sigma:0.4,
            c:1.5,
            g:0.05,
            m:0.2,
            y:0.2,
            v0:0.5,
            speed:0.5,
            eta_v:0.3,
            rho:0.4,
        },  
        num_u:8,
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price',
        model:'cgmy'
    },{
        includeImpliedVolatility:true
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(Array.isArray(parsedVal)).toEqual(true)
        done()
    })
})
it('correctly calls constraints', (done)=>{
    const event=createEvent({
        
    }, {
        model:'merton'
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
        maturity:5,
        rate:0.05,
        asset:50.0,
        cf_parameters:{
            sigma:0.4,
            lambda:1.5,
            mu_l:0.05,
            sig_l:0.2,
            v0:0.5,
            speed:0.5,
            eta_v:0.3,
            rho:0.4
        },       
        num_u:8,
        quantile:0.01
    }, {
        densityType:'riskmetric',
        model:'merton'
    })
    handler.density(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.value_at_risk).toBeDefined()
        expect(parsedVal.expected_shortfall).toBeDefined()
        done()
    })
})
it('correctly errors when not enough parameters', (done)=>{


    const event=createEvent({
        strikes:[40, 50, 60],
        maturity:5,
        rate:0.05,
        asset:50.0,
        cf_parameters:{
            sigma:0.5,
            lambda:1.5,
            mu_l:0.05,
            sig_l:0.2,
            speed:0.5,
            eta_v:0.3,
            rho:0.4
        },       
        num_u:8,
        quantile:0.01
    }, {
        densityType:'riskmetric',
        model:'merton'
    })
    handler.density(event, {}, (_err, val)=>{
        expect(val.body.trim()).toEqual('Error: Custom { kind: Other, error: StringError("Parameter v0 does not exist") }')
        done()
    })
})
it('correctly errors when out of bounds', (done)=>{


    const event=createEvent({
        strikes:[40, 50, 60],
        maturity:5,
        rate:0.05,
        asset:50.0,
        cf_parameters:{
            sigma:-0.5,
            lambda:1.5,
            mu_l:0.05,
            sig_l:0.2,
            v0:0.5,
            speed:0.5,
            eta_v:0.3,
            rho:0.4
        },       
        num_u:8,
        quantile:0.01
    }, {
        densityType:'riskmetric',
        model:'merton'
    })
    handler.density(event, {}, (_err, val)=>{
        expect(val.body.trim()).toEqual('Error: Custom { kind: Other, error: StringError("Parameter sigma out of bounds") }')
        done()
    })
})