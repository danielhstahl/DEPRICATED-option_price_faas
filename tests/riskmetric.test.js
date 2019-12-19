'use strict'
const { location, timeout } = require('./binaryLocation.json')
const command = `./${location}`
const request = require('request')
const { spawn } = require('child_process')
const params = require('./parameter4.json')
const error = require('./riskMetricError.json')
jest.setTimeout(timeout)
let server
beforeEach(() => {
    server = spawn(command, [], { env: { PORT: '8080' } })
});

afterEach(() => {
    server.kill()
});
describe('risk_measures', () => {
    it('returns risk_measures', done => {

        request.post({ url: 'http://localhost:8080/v1/heston/riskmetric', body: JSON.parse(params.body), json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(Array.isArray(body))
            expect(body.value_at_risk).toBeDefined()
            expect(body.expected_shortfall).toBeDefined()
            expect(body.value_at_risk).toBeTruthy()
            expect(body.expected_shortfall).toBeTruthy()
            done()
        })

    })
    it('returns error if not all parameters included', done => {
        request.post({ url: 'http://localhost:8080/v1/heston/riskmetric', body: JSON.parse(error.body), json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(body).toBeDefined()
            expect(body).toEqual("Parameter quantile does not exist.")
            done()
        })
    })
})
