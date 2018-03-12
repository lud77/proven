#!/usr/bin/env node

const R = require('ramda');
const options = require('commander');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

const readFileAsync = Promise.promisify(fs.readFile);

const { getAllModuleStats } = require('../lib/npm');

const {
    processTargetPackageJson,
    processIgnoreList,
    removeIgnored,
    extractLimits,
    processModules,
    validatePackage
} = require('../lib/proven');

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
    .option('--skip-deps', 'Check dependencies (default true)')
    .option('--check-dev-deps', 'Check dev-dependencies (default false)')
    .parse(process.argv);

if (options.skipDeps && !options.checkDevDeps) {
    console.log('Nothing to check!');
    process.exit(0);
}

const base = options.dir ? options.dir : './';
const packageJsonPath = path.join(base, 'package.json');
const configPath = options.config ? options.config : path.join(base, '.provenrc');
const ignorePath = path.join(base, '.provenignore');

processTargetPackageJson(readFileAsync(packageJsonPath), options.skipDeps, options.checkDevDeps)
    .then((dependencies) => [
        R.toPairs(dependencies),
        processIgnoreList(readFileAsync(ignorePath))
    ])
    .then(([dependencyPairs, ignoreList]) => [
        ignoreList
            .then(removeIgnored)
            .then((shouldIgnore) => R.reject(shouldIgnore, dependencyPairs))
            .then(getAllModuleStats),
        readFileAsync(configPath)
            .catch(() => false)
            .then((configFile) => configFile ? extractLimits(configFile) : defaultLimits)
    ])
    .then(([stats, limits]) => limits.then(processModules(stats)))
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
