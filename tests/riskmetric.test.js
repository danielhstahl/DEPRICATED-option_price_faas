'use strict'
const command='sudo docker run --rm -v "$PWD":/var/task -i -e DOCKER_LAMBDA_USE_STDIN=1 lambci/lambda:provided -bootstrap ./target/x86_64-unknown-linux-musl/release/riskmetric'
const {exec} = require('child_process')
const spawnCommand=(jsonFile, callback)=>{
    exec('cat '+jsonFile+' | '+command, callback)
}
jest.setTimeout(20000)
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