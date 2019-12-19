'use strict'
const { location, timeout } = require('./binaryLocation.json')
const command = `./${location}`
const request = require('request')
const { spawn } = require('child_process')
const params = require('./parameter3.json')
const error = require('./densityError.json')
jest.setTimeout(timeout)
let server
beforeEach(() => {
    server = spawn(command, [], { env: { PORT: '8080' } })
});

afterEach(() => {
    server.kill()
});
describe('density', () => {
    it('returns array of value and points', done => {

        request.post({ url: 'http://localhost:8080/v1/heston/density', body: JSON.parse(params.body), json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(Array.isArray(body))
            expect(body[0].value).toBeDefined()
            expect(body[0].at_point).toBeDefined()
            done()
        })

    })
    it('returns error if not all parameters included', done => {
        request.post({ url: 'http://localhost:8080/v1/heston/density', body: JSON.parse(error.body), json: true }, (err, { body }) => {
            if (err) {
                throw (err)
            }
            expect(body).toBeDefined()
            expect(body).toEqual("missing field `rate` at line 1 column 100")
            done()
        })
    })
})