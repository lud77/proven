#!/usr/bin/env node

const R = require('ramda');
const options = require('commander');
// const semver = require('semver');

const { getAllModuleStats } = require('../lib/npm');
const { readTargetPackageJson, processModules, validatePackage } = require('../lib/proven');

const packageJson = require('../package.json');

options
    .version(packageJson.version)
    .option('-d, --directory <dir>', 'Scan the target directory instead of the CWD')
    .option('-r, --recursive <depth>', 'Check dependencies recursively up to a certain depth')
    .parse(process.argv);

readTargetPackageJson()
//    .then(R.map(R.replace(/[\^|\~]/g, 'v')))
//    .then(R.filter(semver.valid))
    .then(R.toPairs)
    .then(getAllModuleStats)
    .then(processModules)
    .then(validatePackage)
    .then((isValid) => {
        if (!isValid) process.exit(1);
    })
    .catch(() => {});

/*
readFileAsync('.provenignore')
		.then((ignoreStr) => ignoreStr.toString('utf8').split('\n'))
		.catch(() => {})
		.then((ignoreList) => {
		    return Promise.map([readFileAsync(console.log('xyz', ignoreList), 'xxx']);
		})
		.catch(() => {});
*/
