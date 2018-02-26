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

const processNpmData = (data, version) => ({
	freshness: moment.diff(moment(data.time.modified), 'days'),
	maintainers: data.maintainers.length,
	versions: data.versions.length,
	license: data.license,
	repository: data.repository !== undefined
});

readTargetPackageJson()
    .then(R.map(R.replace(/[\^|\~]/g, 'v')))
    .then(R.map(semver.valid))
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
