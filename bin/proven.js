#!/usr/bin/env node

const R = require('ramda');
const moment = require('moment');
const options = require('commander');
const semver = require('semver');
const Promise = require('bluebird');

const { getAllModuleStats } = require('../lib/npm');
const { die, readTargetPackageJson } = require('../lib/proven');

const packageJson = require('../package.json');

options
    .version(packageJson.version)
    .option('-d, --directory <dir>', 'Scan the target directory instead of the CWD')
	.option('-r, --recursive <depth>', 'Check dependencies recursively up to a certain depth')
	.parse(process.argv);

const defaultRule = (data) => ({
    age: data.age < 300,
    maintainers: data.maintainers > 1,
    versions: data.versions > 10,
    repository: data.repository,
});

const applyRule = defaultRule;

const processNpmData = (data) => ({
	age: moment().diff(moment(data.time.modified), 'days'),
	maintainers: data.maintainers.length,
	versions: R.toPairs(data.versions).length,
	license: data.license,
	repository: data.repository !== undefined
});

const parseJson = (json) => {
    try {
        return JSON.parse(json);
    } catch (err) {
        console.log(err.message);
        process.exit();
    }
};

const validateModules = (rules) => R.reduce((acc, value) => acc && value[1], true, R.toPairs(rules));
const validatePackage = (rules) => R.reduce((acc, value) => acc && value[1], true, R.toPairs(rules));

readTargetPackageJson()
    //.then(R.map(R.replace(/[\^|\~]/g, 'v')))
    //.then(R.map(semver.valid))
    .then(Object.keys)
    .then(getAllModuleStats)
    .then(R.map(processNpmData));

/*
readFileAsync('.provenignore')
		.then((ignoreStr) => ignoreStr.toString('utf8').split('\n'))
		.catch(() => {})
		.then((ignoreList) => {
		    return Promise.map([readFileAsync(console.log('xyz', ignoreList), 'xxx']);
		})
		.catch(() => {});
*/
