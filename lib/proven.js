const Promise = require('bluebird');
const fs = require('fs');
const R = require('ramda');
const moment = require('moment');

const { parseJson } = require('./util');

const readFileAsync = Promise.promisify(fs.readFile);

const die = (msg) => (err) => {
    logger(msg);
    logger(err.message);
    process.exit();
};

const readTargetPackageJson = () => readFileAsync('./package.json')
    .catch(die(console.log, 'Error! Not a node project'))
    .then((localPackageJsonStr) => JSON.parse(localPackageJsonStr.toString('utf8')))
    .catch(die(console.log, 'Error! Invalid package.json file'))
    .then((localPackageJson) => Object.assign({}, localPackageJson.dependencies, localPackageJson.devDependencies));

const defaultRule = (data) => ({
    age: data.age < 300,
    maintainers: data.maintainers > 1,
    versions: data.versions > 10,
    repository: data.repository
});

const processNpmData = (data) => ({
    age: moment().diff(moment(data.time.modified), 'days'),
    maintainers: data.maintainers.length,
    versions: R.toPairs(data.versions).length,
    license: data.license,
    repository: data.repository !== undefined
});

const processModules = (moduleStats) => Promise.map(moduleStats, processModule);

const processModule = ([name, version, stats]) =>
    stats
        .then(parseJson)
        .then(processNpmData)
        .then(applyRule)
        .then(validateModules);

const validateModules = (rules) => R.reduce((acc, value) => acc && value[1], true, R.toPairs(rules));
const validatePackage = (rules) => R.reduce((acc, value) => acc && value[1], true, R.toPairs(rules));

module.exports = {
    readTargetPackageJson,
    defaultRule,
    processModules,
    validatePackage
};
