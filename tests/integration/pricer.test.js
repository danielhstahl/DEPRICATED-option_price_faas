const handler=require('../../lambda/pricer')
const createEvent=(data, parameters, queryStringParameters)=>({
    body:JSON.stringify(data),
    pathParameters:parameters,
    queryStringParameters
})
it('correctly returns heston price', (done)=>{
    //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 15
    const rate=0.0
    const maturity=1.0
    const asset=100
    const b=.0398
    const a=1.5768
    const c=.5751
    const rho=-.5711
    const v0=.0175

    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        cf_parameters:{
            sigma:Math.sqrt(b), 
            speed:a,
            v0,
            eta_v:c,
            rho
        },
        strikes:[100],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        model:'heston'
    })
    //heston is a subset of merton, with some variable changes
    const eventMerton=createEvent({
        num_u:8,
        rate,
        maturity,
        asset,
        cf_parameters:{
            sigma:Math.sqrt(b), 
            speed:a,
            v0:v0/b,
            eta_v:c/Math.sqrt(b),
            rho,
            sig_l:0.0,
            mu_l:0.0,
            lambda:0.0
        },
        strikes:[100],
        quantile:0.01
    }, {
        optionType:'call',
        sensitivity:'price',
        model:'merton'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal[0].value).toBeCloseTo(5.78515545, 3)
        const hestonResult=parsedVal[0].value
        handler.calculator(eventMerton, {}, (_err, val)=>{
            const parsedVal=JSON.parse(val.body)
            expect(parsedVal[0].value).toEqual(hestonResult)
            done()
        })
    })
})
it('correctly returns heston price and iv', (done)=>{
    //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 15
    const rate=0.0
    const maturity=1.0
    const asset=100
    const b=.0398
    const a=1.5768
    const c=.5751
    const rho=-.5711
    const v0=.0175

    //convert parameters
    
    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        cf_parameters:{
            sigma:Math.sqrt(b), 
            speed:a,
            v0,
            eta_v:c,
            rho
        },
        strikes:[100],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        model:'heston'
    }, {
        includeImpliedVolatility:true
    })
    return handler.calculator(event, {}, (_err, val)=>{
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
        cf_parameters:{
            sigma, 
            lambda,
            mu_l,
            sig_l,
            speed:0,
            v0:1,
            eta_v:0,
            rho:0
        },        
        strikes:[strike],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        model:'merton'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal[0].value).toBeCloseTo(5.9713, 3)
        done()
    })
})
it('correctly returns cgmy price: v1', (done)=>{
    //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 18
    //S0 = 100, K = 100, r = 0.1, q = 0, C = 1, G = 5, M = 5, T = 1
    const rate=.1
    const maturity=1.0
    const asset=100
    const c=1
    const g=5
    const m=5
    const y=0.5
    const strike=100
    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        cf_parameters:{
            sigma:0, 
            c,
            g,
            m,
            y,
            speed:0,
            v0:1,
            eta_v:0,
            rho:0
        },        
        strikes:[strike],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        model:'cgmy'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal[0].value).toBeCloseTo(19.812948843, 3)
        done()
    })
})
it('correctly returns cgmy price: v2', (done)=>{
    //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 18
    //S0 = 100, K = 100, r = 0.1, q = 0, C = 1, G = 5, M = 5, T = 1
    const rate=.1
    const maturity=1.0
    const asset=100
    const c=1
    const g=5
    const m=5
    const y=1.5
    const strike=100
    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        cf_parameters:{
            sigma:0, 
            c,
            g,
            m,
            y,
            speed:0,
            v0:1,
            eta_v:0,
            rho:0
        },        
        strikes:[strike],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        model:'cgmy'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal[0].value).toBeCloseTo(49.790905469, 3)
        done()
    })
})
it('correctly returns cgmy price: v3', (done)=>{
    //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 18
    //S0 = 100, K = 100, r = 0.1, q = 0, C = 1, G = 5, M = 5, T = 1
    const rate=.1
    const maturity=1.0
    const asset=100
    const c=1
    const g=5
    const m=5
    const y=1.98
    const strike=100
    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        cf_parameters:{
            sigma:0, 
            c,
            g,
            m,
            y,
            speed:0,
            v0:1,
            eta_v:0,
            rho:0
        },        
        strikes:[strike],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        model:'cgmy'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal[0].value).toBeCloseTo(99.999905510, 3)
        done()
    })
})
it('correctly returns monte carlo price', (done)=>{
    //https://github.com/phillyfan1138/fang_oost_cal_charts/blob/master/docs/OptionCalculation.Rnw

    const rate=0.03
    const maturity=1.0
    const asset=50
    const sig_l=0.1
    const sigma=0.2
    const mu_l=-0.05
    const strike=50
    const lambda=0.5
    const speed=0.3
    const eta_v=0.2
    const v0=0.9
    const delta=0.1
    const rho=-0.5
    
    const parameters={
        num_u:8,
        rate,
        maturity,
        asset,
        cf_parameters:{
            sigma, 
            lambda,
            mu_l,
            sig_l,
            speed,
            v0,
            eta_v,
            rho,
        },        
        strikes:[strike],
        quantile:0.01
    }
    const event=createEvent(parameters, {
        optionType:'call',
        sensitivity:'price',
        model:'merton'
    })
    return handler.calculator(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        //MC price is 4.779121, bounds are provided as test criteria
        expect(parsedVal[0].value).toBeLessThan(4.816284)
        expect(parsedVal[0].value).toBeGreaterThan(4.741957)
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
        cf_parameters:{
            sigma, 
            lambda,
            mu_l,
            sig_l,
            speed,
            v0,
            eta_v,
            rho
        },
        quantile:.01,
        strikes:[]
    }
    const event=createEvent(parameters, {
        model:'merton'
    })
    return handler.riskmetric(event, {}, (_err, val)=>{
        const parsedVal=JSON.parse(val.body)
        expect(parsedVal.value_at_risk).toBeCloseTo(.261503, 3)
        done()
    })
})

