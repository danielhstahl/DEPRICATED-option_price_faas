const handler=require('../../lambda/pricer')
const createEvent=(data, parameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters
})
it('correctly returns heston price', (done)=>{
    //http://ta.twi.tudelft.nl/mf/users/oosterle/oosterlee/COS.pdf pg 15
    const rate=0.0
    const maturity=1.0
    const asset=100
    const b=.0398
    const a=1.5768
    const c=.5751
    const rho=-.5711
    const v0=.0175

    //convert parameters
    const sigma=Math.sqrt(b)
    const speed=a
    const v0Hat=v0/b
    const eta_v=c/Math.sqrt(b)

    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        sigma, 
        lambda:0,
        mu_l:0,
        sig_l:0,
        speed,
        v0:v0Hat,
        eta_v,
        rho,
        strikes:[100],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal[0].value).toBeCloseTo(5.78515545, 3)
        done()
    })
})
it('correctly returns merton price', (done)=>{
    //https://www.upo.es/personal/jfernav/papers/Jumps_JOD_.pdf pg 8
    const rate=.1
    const maturity=.5
    const asset=38
    const sig_l=Math.sqrt(.05)
    const sigma=sig_l
    const mu_l=-sig_l*sig_l*.5
    const strike=35
    const lambda=1
    
    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        sigma, 
        lambda,
        mu_l,
        sig_l,
        speed:0,
        v0:1,
        eta_v:0,
        rho:0,
        strikes:[strike],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        algorithm:'fangoost'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal[0].value).toBeCloseTo(5.9713, 3)
        done()
    })
})
it('correctly returns VaR', (done)=>{
    //https://github.com/phillyfan1138/levy-functions/issues/27
    const rate=.004
    const maturity=.187689
    const asset=191.96
    const sig_l=.220094
    const sigma=.3183
    const mu_l=-.302967
    const lambda=.204516
    const speed=2.6726
    const v0=.237187
    const rho=-.182754
    const eta_v=0.0
    
    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        sigma, 
        lambda,
        mu_l,
        sig_l,
        speed,
        v0,
        eta_v,
        rho,
        quantile:.01,
        strikes:[]
    }
    const event=createEvent(parameters, {
        densityType:'riskmetric'
    })
    return handler.density(event, {}, (_err, val)=>{
        console.log(val.body)
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.value_at_risk).toBeCloseTo(.261503, 3)
        done()
    })
})

