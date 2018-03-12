const Promise = require('bluebird');
const moment = require('moment');
const assert = require('chai').assert;

const proven = require('../../lib/proven');

const defaultLimits = {
    maxAge: 300,
    minMaintainers: 2,
    minVersions: 10,
    repoRequired: true
};

const json = {
    dependencies: {
        a: '1'
    },
    devDependencies: {
        b: '2'
    }
};

const moduleStats = ['module-name', 'module-version', Promise.resolve({
    time: {
        modified:moment().subtract(7,'d').format('YYYY-MM-DD')
    },
    maintainers: ['x'],
    versions: ['x'],
    license: 'x',
    repository: 'x'
}).then(JSON.stringify)];

describe('Proven lib', () => {
    describe('processTargetPackageJson', () => {
        it('should return an object with all the dependencies', (done) => {
            proven.processTargetPackageJson(Promise.resolve(JSON.stringify(json)), false, true)
                .then((res) => {
                    assert.deepEqual(res, [['a', '1'], ['b', '2']]);
                    done();
                });
        });
    });

    describe('processModules', () => {
        it('should return a list of validation messages grouped by module', (done) => {
            proven.processModules([moduleStats])(defaultLimits)
                .then((messages) => {
                    assert.equal(messages.length, 1);
                    assert.equal(messages[0].length, 3);
                    assert.equal(messages[0][0], 'module-name');
                    assert.equal(messages[0][1], 'module-version');
                    assert.equal(messages[0][2].length, 2);
                    done();
                });
        });
    });
});
