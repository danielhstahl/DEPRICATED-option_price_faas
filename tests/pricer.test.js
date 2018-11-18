'use strict'
const command='sudo docker run --rm -v "$PWD":/var/task -i -e DOCKER_LAMBDA_USE_STDIN=1 lambci/lambda:go1.x ./target/x86_64-unknown-linux-musl/release/pricer'
const {exec} = require('child_process')
const spawnCommand=(jsonFile, callback)=>{
    exec('cat '+jsonFile+' | '+command, callback)
}
/*
spawnCommand('./tests/parameter1.json', (err, result)=>{
    if(err){
        throw(err)
    }
    const res=JSON.parse(result)
    console.log(JSON.parse(res.body))
    //expect(Array.isArray(JSON.parse(result)))
    //done()
})*/
describe('option prices', ()=>{
    it('returns array of value and points', done=>{
        spawnCommand('./tests/parameter1.json', (err, result)=>{
            if(err){
                throw(err)
            }
            const res=JSON.parse(JSON.parse(result).body)
            expect(Array.isArray(res))
            expect(res[0].value).toBeDefined()
            expect(res[0].at_point).toBeDefined()
            expect(res[0].iv).toBeUndefined()
            done()
        })
    })
    it('returns array of value, points, and iv', done=>{
        spawnCommand('./tests/parameter2.json', (err, result)=>{
            if(err){
                throw(err)
            }
            const res=JSON.parse(JSON.parse(result).body)
            expect(Array.isArray(res))
            expect(res[0].value).toBeDefined()
            expect(res[0].at_point).toBeDefined()
            expect(res[0].iv).toBeDefined()
            expect(res[0].iv).toBeTruthy()
            done()
        })
    })
})
describe('density', ()=>{
    it('returns array of value and points', done=>{
        spawnCommand('./tests/parameter3.json', (err, result)=>{
            if(err){
                throw(err)
            }
            const res=JSON.parse(JSON.parse(result).body)
            expect(Array.isArray(res))
            expect(res[0].value).toBeDefined()
            expect(res[0].at_point).toBeDefined()
            done()
        })
    })
})
describe('risk_measures', ()=>{
    it('returns risk_measures', done=>{
        spawnCommand('./tests/parameter4.json', (err, result)=>{
            if(err){
                throw(err)
            }
            const res=JSON.parse(JSON.parse(result).body)
            expect(res.value_at_risk).toBeDefined()
            expect(res.expected_shortfall).toBeDefined()
            expect(res.value_at_risk).toBeTruthy()
            expect(res.expected_shortfall).toBeTruthy()
            done()
        })
    })
})