'use strict'
const { location, timeout } = require('./binaryLocation.json')
const command = `./${location}`
const request = require('request')
const { spawn } = require('child_process')
const params = require('./parameter4.json')
const error = require('./riskMetricError.json')
jest.setTimeout(timeout)
let server
beforeAll(() => {
    server = spawn(command, [], { env: { PORT: '8080' } })
})

afterAll(() => {
    server.kill()
})
describe('risk_measures', () => {
    it('returns risk_measures', done => {

        request.post({ url: 'http://localhost:8080/v1/heston/riskmetric', body: JSON.parse(params.body), json: true }, (err, response) => {
            if (err) {
                throw (err)
            }
            expect(Array.isArray(response.body))
            expect(response.body.value_at_risk).toBeDefined()
            expect(response.body.expected_shortfall).toBeDefined()
            expect(response.body.value_at_risk).toBeTruthy()
            expect(response.body.expected_shortfall).toBeTruthy()
            done()
        })

    })
    it('returns error if not all parameters included', done => {
        request.post({ url: 'http://localhost:8080/v1/heston/riskmetric', body: JSON.parse(error.body), json: true }, (err, response) => {
            if (err) {
                throw (err)
            }
            expect(response.body).toBeDefined()
            expect(response.body.err).toEqual("Parameter quantile does not exist.")
            done()
        })
    })
})
