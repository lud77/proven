#!/usr/bin/env node

const R = require('ramda');
const moment = require('moment');
const options = require('commander');
// const semver = require('semver');
const Promise = require('bluebird');

const { getAllModuleStats } = require('../lib/npm');
const { readTargetPackageJson, defaultRule } = require('../lib/proven');
const { parseJson } = require('util');

const packageJson = require('../package.json');

options
    .version(packageJson.version)
    .option('-d, --directory <dir>', 'Scan the target directory instead of the CWD')
    .option('-r, --recursive <depth>', 'Check dependencies recursively up to a certain depth')
    .parse(process.argv);

const applyRule = defaultRule;

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

readTargetPackageJson()
//    .then(R.map(R.replace(/[\^|\~]/g, 'v')))
//    .then(R.filter(semver.valid))
    .then(R.toPairs)
    .then(getAllModuleStats)
    .then(processModules)
    .then(validatePackage)
    .then(x => console.log(x) || x)
    .then((isValid) => {
        if (!isValid) process.exit(1);
    })
    .catch((err) => {})

/*
readFileAsync('.provenignore')
		.then((ignoreStr) => ignoreStr.toString('utf8').split('\n'))
		.catch(() => {})
		.then((ignoreList) => {
		    return Promise.map([readFileAsync(console.log('xyz', ignoreList), 'xxx']);
		})
		.catch(() => {});
*/
