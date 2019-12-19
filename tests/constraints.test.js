'use strict'
const { location, timeout } = require('./binaryLocation.json')
const command = `./${location}`
const request = require('request')
const { spawn } = require('child_process')
jest.setTimeout(timeout)
let server
beforeEach(() => {
    server = spawn(command, [], { env: { PORT: '8080' } })
});

afterEach(() => {
    server.kill()
});
describe('risk_measures', () => {
    it('returns constraints for cgmy', done => {

        request.get({ url: 'http://localhost:8080/v1/cgmy/parameters/parameter_ranges', json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(body.c).toBeDefined()
            expect(body.c).toBeTruthy()
            done()
        })

    })
    it('returns constraints for heston', done => {

        request.get({ url: 'http://localhost:8080/v1/heston/parameters/parameter_ranges', json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(body.v0).toBeDefined()
            expect(body.c).toBeUndefined()
            expect(body.mu_l).toBeUndefined()
            expect(body.v0).toBeTruthy()
            done()
        })

    })
    it('returns constraints for merton', done => {

        request.get({ url: 'http://localhost:8080/v1/merton/parameters/parameter_ranges', json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(body.mu_l).toBeDefined()
            expect(body.mu_l).toBeTruthy()
            done()
        })

    })
    it('returns constraints for market', done => {

        request.get({ url: 'http://localhost:8080/v1/market/parameters/parameter_ranges', json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(body.asset).toBeDefined()
            expect(body.asset).toBeTruthy()
            done()
        })

    })

})
