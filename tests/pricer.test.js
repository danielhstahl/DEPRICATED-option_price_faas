'use strict'
const {location, timeout}=require('./binaryLocation.json')
const command=`sudo docker run --rm -v "$PWD":/var/task -i -e DOCKER_LAMBDA_USE_STDIN=1 lambci/lambda:provided -bootstrap ${location}/pricer`

const {exec} = require('child_process')
const spawnCommand=(jsonFile, callback)=>{
    exec('cat '+jsonFile+' | '+command, callback)
}
jest.setTimeout(timeout)

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
    it('returns error if not all parameters included', done=>{
        spawnCommand('./tests/pricerError.json', (err, result)=>{
            if(err){
                throw(err)
            }
            const res=JSON.parse(JSON.parse(result).body)
            expect(res.err).toBeDefined()
            expect(res.err).toEqual("Parameter strikes does not exist")
            done()
        })
    })
})

