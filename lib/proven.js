const Promise = require('bluebird');
const R = require('ramda');
const moment = require('moment');
const chalk = require('chalk');
const spdxParse = require('spdx-expression-parse');

const { parseJson, die } = require('./util');

const processTargetPackageJson = (packageJson, skipDeps, checkDevDeps) => packageJson
    .catch(die('Error! Not a node project'))
    .then((localPackageJsonStr) => JSON.parse(localPackageJsonStr.toString('utf8')))
    .catch(die('Error! Invalid package.json file'))
    .then((localPackageJson) => Object.assign({},
        skipDeps ? {} : localPackageJson.dependencies,
        checkDevDeps ? localPackageJson.devDependencies : {}
    ))
    .then(R.toPairs);

const processIgnoreList = (ignoreBuffer) =>
    Promise.resolve(ignoreBuffer ? ignoreBuffer.toString('utf8').split('\n') : [])
        .then(R.map(R.trim))
        .then(R.filter(Boolean));

const removeIgnored = (deps) => (ignoreList) => R.reject((dep) => R.contains(dep[0])(ignoreList))(deps);

const extractLimits = (configJson) => {
    try {
        return JSON.parse(configJson.toString('utf8'));
    } catch (e) {
        console.log('Invalid configuration file.');
        process.exit(1);
    }
};

const getLicenses = (spdxExp) => {
    if (spdxExp.license) return [spdxExp.license];
    return getLicenses(spdxExp.left).concat(getLicenses(spdxExp.right));
};

const hasValidLicense = (license, allowedLicenses) => {
    if (allowedLicenses === 'any') return true;

    try {
        const expression = spdxParse(license);
        if (allowedLicenses === 'any spdx') return true;

        const mentionedLicenses = getLicenses(expression);
        return R.intersection(mentionedLicenses, allowedLicenses).length > 0;
    } catch (e) {
        return false;
    }
};

const defaultMessages = ({ maxAge, minMaintainers, minVersions }) => ({
    maxAge: `Module ${chalk.yellowBright(`has not been updated in ${maxAge} days`)}`,
    minMaintainers: `Module is maintained by ${chalk.yellowBright(`less than ${minMaintainers} developer(s)`)}`,
    minVersions: `Module has ${chalk.yellowBright(`less than ${minVersions} versions`)}`,
    repoRequired: `Module ${chalk.yellowBright(`doesn't have a repository listed`)}`,
    allowedLicenses: `Module ${chalk.yellowBright(`has a disallowed license or invalid license field`)}`
});

const applyRule = ({ maxAge, minMaintainers, minVersions, repoRequired, allowedLicenses }) => (data) => ({
    maxAge: data.age < maxAge,
    minMaintainers: data.maintainers >= minMaintainers,
    minVersions: data.versions > minVersions,
    repoRequired: data.repository || !repoRequired,
    allowedLicenses: hasValidLicense(data.license, allowedLicenses)
});

const processNpmData = (data) => ({
    age: moment().diff(moment(data.time.modified), 'days'),
    maintainers: data.maintainers.length,
    versions: R.toPairs(data.versions).length,
    license: data.license,
    repository: data.repository !== undefined
});

const processModules = (moduleStats) => (limits) => Promise.map(moduleStats, processModule(limits));

const processModule = (limits) => ([name, version, stats]) =>
    stats
        .then(parseJson)
        .then(processNpmData)
        .then(applyRule(limits))
        .then(validateModules(defaultMessages(limits)))
        .then((validatedModules) => [name, version, validatedModules]);

const validateModules = (messages) => (rules) => R.reduce((acc, [rule, isValid]) => {
    if (isValid) return acc;
    return acc.concat(messages[rule]);
}, [], R.toPairs(rules));

const validatePackage = (modules) => R.reduce((acc, [name, version, messages]) => {
    if (messages.length === 0) return acc;
    return acc.concat([`  ${chalk.red('Failed validation')} for module ${chalk.white.bold(name, `(${version})`)}`].concat(R.map((message) => `    ${message}`, messages)).join('\n'));
}, [], modules);

module.exports = {
    processTargetPackageJson,
    processIgnoreList,
    removeIgnored,
    extractLimits,
    processModules,
    validatePackage,
    hasValidLicense
};
