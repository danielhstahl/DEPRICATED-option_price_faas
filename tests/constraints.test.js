'use strict'
const command='sudo docker run --rm -v "$PWD":/var/task -i -e DOCKER_LAMBDA_USE_STDIN=1 lambci/lambda:go1.x ./target/x86_64-unknown-linux-musl/release/output_constraints'
const {exec} = require('child_process')
const spawnCommand=(jsonFile, callback)=>{
    exec('cat '+jsonFile+' | '+command, callback)
}
jest.setTimeout(20000)
it('returns constraints for cgmy', done=>{
    spawnCommand('./tests/parameter5.json', (err, result)=>{
        if(err){
            throw(err)
        }
        const res=JSON.parse(JSON.parse(result).body)
        expect(res.c).toBeDefined()
        expect(res.c).toBeTruthy()
        done()
    })
})
it('returns constraints for heston', done=>{
    spawnCommand('./tests/parameter6.json', (err, result)=>{
        if(err){
            throw(err)
        }
        const res=JSON.parse(JSON.parse(result).body)
        expect(res.v0).toBeDefined()
        expect(res.c).toBeUndefined()
        expect(res.mu_l).toBeUndefined()
        expect(res.v0).toBeTruthy()
        done()
    })
})
it('returns constraints for merton', done=>{
    spawnCommand('./tests/parameter7.json', (err, result)=>{
        if(err){
            throw(err)
        }
        const res=JSON.parse(JSON.parse(result).body)
        expect(res.mu_l).toBeDefined()
        expect(res.mu_l).toBeTruthy()
        done()
    })
})
it('returns constraints for market', done=>{
    spawnCommand('./tests/parameter8.json', (err, result)=>{
        if(err){
            throw(err)
        }
        const res=JSON.parse(JSON.parse(result).body)
        expect(res.asset).toBeDefined()
        expect(res.asset).toBeTruthy()
        done()
    })
})