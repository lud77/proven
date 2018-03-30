#!/usr/bin/env node

const options = require('commander');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const R = require('ramda');

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
    minMaintainers: 1,
    minVersions: 5,
    repoRequired: true,
    allowedLicenses: 'any spdx',
    docsRequired: false
};

options
    .version(packageJson.version)
    .option('-d, --directory <dir>', 'Scan the target directory instead of the CWD')
    .option('-c, --config <config>', 'Load the specified config file instead of the default one')
    .option('-r, --recursive <depth>', 'Check dependencies recursively up to a certain depth')
    .option('-s, --silent', 'Produce exit code 0 in case of failure')
    .option('--skip-deps', 'Don\'t check dependencies')
    .option('--check-dev-deps', 'Check dev-dependencies')
    .parse(process.argv);

if (options.skipDeps && !options.checkDevDeps) {
    console.log('Nothing to check!');
    process.exit(0);
}

const failCode = options.silent ? 0 : 1;

const base = options.dir ? options.dir : process.cwd();
const packageJsonPath = path.join(base, 'package.json');
const configPath = options.config ? options.config : path.join(base, '.provenrc');
const ignorePath = path.join(base, '.provenignore');

processTargetPackageJson(readFileAsync(packageJsonPath), options.skipDeps, options.checkDevDeps)
    .then((deps) => [
        readFileAsync(ignorePath)
            .catch(() => false)
            .then(processIgnoreList)
            .then(removeIgnored(deps))
            .then((modules) => console.log(`\nChecking modules:\n${chalk.bold(chalk.white(` - ${R.map((module) => module[0], modules).join('\n - ')}`))}`) || modules)
            .then(getAllModuleStats),
        readFileAsync(configPath)
            .catch(() => false)
            .then((configFile) => configFile ? extractLimits(configFile) : defaultLimits)
    ])
    .then(([stats, limits]) => limits.then(processModules(stats)))
    .then(validatePackage)
    .then((messages) => {
        console.log('\n');
        if (messages.length === 0) {
            console.log(`${chalk.green('  All modules comply with the policy')}\n\n`);
            process.exit(0);
        }

        console.log(messages.join('\n\n'));
        console.log(`\n\n  ${chalk.red(`${messages.length} failed`)}\n`);
        process.exit(failCode);
    })
    .catch((err) => {
        console.log(err);
        process.exit(2);
    });
