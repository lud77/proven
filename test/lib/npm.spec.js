const assert = require('chai').assert;
const nock = require('nock');

const npm = require('../../lib/npm');

describe('NPM API proxy', () => {
    describe('getAllModuleStats', () => {
        it('should return a list of modules with additional info from the API', (done) => {
            nock('https://registry.npmjs.org')
                .get('/a')
                .reply(200, 'module info');

            nock('https://registry.npmjs.org')
                .get('/b')
                .reply(200, 'module info');

            npm.getAllModuleStats([['a', ''], ['b', '']])
                .then((res) => {
                    assert.equal(res[0].length, 3);
                    assert.equal(res[1].length, 3);
                    done();
                });
        });
    });
});
