const assert = require('chai').assert;
const nock = require('nock');

const npm = require('../../lib/npm');

describe('NPM API proxy', () => {
    describe('getAllModuleStatsAndDownloads', () => {
        it('should return a list of modules with additional info from the API', (done) => {
            nock('https://registry.npmjs.org')
                .get('/a')
                .reply(200, 'module info');

            nock('https://registry.npmjs.org')
                .get('/b')
                .reply(200, 'module info');

            nock('https://api.npmjs.org')
                .get('/downloads/point/last-month/a')
                .reply(200, 'module downloads');

            nock('https://api.npmjs.org')
                .get('/downloads/point/last-month/b')
                .reply(200, 'module downloads');

            npm.getAllModuleStatsAndDownloads('last-month')([['a', ''], ['b', '']])
                .then((res) => {
                    assert.equal(res[0].length, 4);
                    assert.equal(res[1].length, 4);
                    done();
                });
        });
    });
});
