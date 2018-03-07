const Promise = require('bluebird');
const assert = require('chai').assert;

const proven = require('../../lib/proven');

const json = {
    dependencies: {
        a: '1'
    },
    devDependencies: {
        b: '2'
    }
};

describe('Proven lib', () => {
    describe('processTargetPackageJson', () => {
        it('should return an object with all the dependencies', (done) => {
            proven.processTargetPackageJson(Promise.resolve(JSON.stringify(json)))
                .then((res) => JSON.stringify(res))
                .then((str) => {
                    assert.equal(str, '{"a":"1","b":"2"}');
                    done();
                });
        });
    });
});
