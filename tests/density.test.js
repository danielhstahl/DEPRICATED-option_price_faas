'use strict'
const { location, timeout } = require('./binaryLocation.json')
const command = `./${location}`
const request = require('request')
const { spawn } = require('child_process')
const params = require('./parameter3.json')
const error = require('./densityError.json')
console.log(JSON.parse(params.body))
console.log(JSON.parse(error.body))
jest.setTimeout(timeout)
describe('density', () => {
    it('returns array of value and points', done => {
        const server = spawn(command, [], { env: { PORT: '8080' } })

        request.post({ url: 'http://localhost:8080/v1/heston/density', body: JSON.parse(params.body), json: true }, (err, { body }) => {
            if (err) {
                //throw new Error(err)
                throw (err)
            }
            //const res = JSON.parse(resstr)
            expect(Array.isArray(body))
            expect(body[0].value).toBeDefined()
            expect(body[0].at_point).toBeDefined()
            done()
        })

    })
    it('returns error if not all parameters included', done => {
        const server = spawn(command, [], { env: { PORT: '8080' } })
        request.post({ url: 'http://localhost:8080/v1/heston/density', body: JSON.parse(error.body), json: true }, (err, { body }) => {
            if (err) {
                //throw new Error(err)
                throw (err)
            }
            console.log(body)

            //const res = JSON.parse(resstr)
            expect(body).toBeDefined()
            expect(body).toEqual("missing field `rate` at line 1 column 100")
            done()
        })
    })
})