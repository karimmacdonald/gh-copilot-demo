//write npm command line to install mocha
//npm install --global mocha

//command to run this test file
//mocha test.js

const assert = require('assert');
const http = require('http');

let server;

before((done) => {
    delete require.cache[require.resolve('./nodeserver')];
    server = require('./nodeserver');
    console.log('Server initialized:', server);
    done();
});

after((done) => {
    console.log('In after()');
    if (server) {
        console.log('Server exists');
        if (server.close) {
            console.log('Closing server');
            server.close((err) => {
                if (err) {
                    console.error('Error closing the server:', err);
                    return done(err);
                }
                console.log('Server closed successfully');
                done();
            });
        } else {
            console.error('Server does not have a close method');
            done();
        }
    } else {
        console.error('Server is not defined');
        done();
    }
});

describe('Node Server', () => {
    it('should return "key not passed" if key is not passed', (done) => {
        http
        .get('http://localhost:3000/get' , (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                assert.equal(data, 'key not passed');
                done();
            });
        });
    });

    it('should return "Hello, world!" if key is equal to "world"', (done) => {
        http
        .get('http://localhost:3000/get?key=world' , (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                assert.equal(data, 'Hello, world!');
                done();
            });
        });
    });

    it('should return true if the phone number is valid', () => {
        const phoneNumber = '1234567890';
        const isValid = validatephoneNumber(phoneNumber);
        assert.equal(isValid, true);
    });

    it('should return false if the phone number is invalid', () => {
        const phoneNumber = '123';
        const isValid = validatephoneNumber(phoneNumber);
        assert.equal(isValid, false);
    });

    it('should return true if the Spanish DNI is valid', () => {
        const dni = '12345678Z';
        const isValid = validateSpanishDNI(dni);
        assert.equal(isValid, true);
    });

    it('should return false if the Spanish DNI is invalid', () => {
        const dni = '12345678A';
        const isValid = validateSpanishDNI(dni);
        assert.equal(isValid, false);
    });

    it('should return the color code #FF0000 for the color "red"', () => {
        const color = 'red';
        const colorCode = returnColorCode(color);
        assert.equal(colorCode, '#FF0000');
    });

    it('should return the number of days between two dates', () => {
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');
        const daysBetween = daysBetweenDates(startDate, endDate);
        assert.equal(daysBetween, 9);
    });
});