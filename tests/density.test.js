'use strict'
const { location, timeout } = require('./binaryLocation.json')
const command = `./${location}`
const request = require('request')
const { spawn } = require('child_process')
jest.setTimeout(timeout)
let server
beforeAll(() => {
    server = spawn(command, [], { env: { PORT: '8080' } })
})
afterAll(() => {
    server.kill()
});
describe('density', () => {
    it('returns array of value and points', done => {
        const body = {
            num_u: 8,
            rate: 0.1,
            maturity: 0.5,
            asset: 38,
            cf_parameters: { sigma: 0.5, speed: 0.1, v0: 0.2, eta_v: 0.1, rho: -0.5 },
            strikes: [100],
            quantile: 0.01
        }
        request.post({ url: 'http://localhost:8080/v2/heston/density', body, json: true }, (err, response) => {
            if (err) {
                throw (err)
            }
            expect(Array.isArray(response.body))
            expect(response.body[0].value).toBeDefined()
            expect(response.body[0].at_point).toBeDefined()
            done()
        })

    })
    it('returns error if not all parameters included', done => {
        const body = {
            num_u: 8,
            maturity: 0.5,
            cf_parameters: { sigma: 0.5, speed: 0.1, v0: 0.2, eta_v: 0.1, rho: -0.5 }
        }
        request.post({ url: 'http://localhost:8080/v2/heston/density', body, json: true }, (err, response) => {
            if (err) {
                throw (err)
            }
            expect(response.body).toBeDefined()
            expect(response.body).toEqual("parse error missing field `rate` at line 1 column 100, received {\"num_u\":8,\"maturity\":0.5,\"cf_parameters\":{\"sigma\":0.5,\"speed\":0.1,\"v0\":0.2,\"eta_v\":0.1,\"rho\":-0.5}}")
            done()
        })
    })
})