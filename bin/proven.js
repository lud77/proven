#!/usr/bin/env node

const R = require('ramda');
const options = require('commander');
const Promise = require('bluebird');
const fs = require('fs');
// const semver = require('semver');

const readFileAsync = Promise.promisify(fs.readFile);

const { getAllModuleStats } = require('../lib/npm');
const { processTargetPackageJson, processModules, validatePackage } = require('../lib/proven');

const packageJson = require('../package.json');

const defaultLimits = {
    maxAge: 300,
    minMaintainers: 2,
    minVersions: 10,
    repoRequired: true
};

options
    .version(packageJson.version)
    .option('-d, --directory <dir>', 'Scan the target directory instead of the CWD')
    .option('-c, --config <config>', 'Load the specified config file instead of the default one')
    .option('-r, --recursive <depth>', 'Check dependencies recursively up to a certain depth')
    .option('--deps <deps>', 'Check dependencies (default true)')
    .option('--dev-deps <devdeps>', 'Check dev-dependencies (default false)')
    .parse(process.argv);

processTargetPackageJson(readFileAsync('./package.json'))
//    .then(R.map(R.replace(/[\^|\~]/g, 'v')))
//    .then(R.filter(semver.valid))
    .then(R.toPairs)
    .then(getAllModuleStats)
    .then(processModules(defaultLimits))
    .then(validatePackage)
    .then((messages) => {
        if (messages.length === 0) {
            console.log('All modules seem to comply with the policy');
            process.exit(0);
        }

        console.log(messages.join('\n\n'));
        process.exit(1);
    })
    .catch((err) => {
        console.log(err);
        process.exit(2);
    });

/*
readFileAsync('.provenignore')
		.then((ignoreStr) => ignoreStr.toString('utf8').split('\n'))
		.catch(() => {})
		.then((ignoreList) => {
		    return Promise.map([readFileAsync(console.log('xyz', ignoreList), 'xxx']);
		})
		.catch(() => {});
*/
