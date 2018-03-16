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
                    assert.deepEqual(res, [
                        ['a', '1'],
                        ['b', '2']
                    ]);
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

    describe('processIgnoreList', () => {
        it('should return a list of trimmed non null elements', (done) => {
            const buf = Buffer.from(' test \n test \n ', 'utf8');
            proven.processIgnoreList(buf)
                .then((pairs) => {
                    assert.equal(pairs.length, 2);
                    assert.equal(pairs[0], 'test');
                    assert.equal(pairs[1], 'test');
                    done();
                });
        });
    });

    describe('removeIgnored', () => {
        it('should return a list of pairs not to be ignored', () => {
            const ignoreList1 = ['a'];
            const ignoreList2 = ['c', 'd'];
            const pairs = [
                ['a', '1'],
                ['b', '1'],
                ['c', '1'],
                ['d', '1']
            ];

            const res1 = proven.removeIgnored(pairs)(ignoreList1);
            assert.equal(res1.length, 3);

            const res2 = proven.removeIgnored(pairs)(ignoreList2);
            assert.equal(res2.length, 2);
        });
    });

    describe('validatePackage', () => {
        it('should return an array of messages', () => {
            const modules = [
                ['x1', '1', ['$$$a', '$$$b']],
                ['x2', '1', []],
                ['x3', '1', ['$$$c', '$$$d', '$$$e']]
            ];

            const res = proven.validatePackage(modules);
            assert.equal(res.length, 2);
            assert.equal(res[0].split('$$$').length, 3);
            assert.equal(res[1].split('$$$').length, 4);
        });
    });
});
