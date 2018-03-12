const Promise = require('bluebird');
const R = require('ramda');
const moment = require('moment');
const chalk = require('chalk');

const { parseJson, die } = require('./util');

const processTargetPackageJson = (packageJson) => packageJson
    .catch(die('Error! Not a node project'))
    .then((localPackageJsonStr) => JSON.parse(localPackageJsonStr.toString('utf8')))
    .catch(die('Error! Invalid package.json file'))
    .then((localPackageJson) => Object.assign({},
        localPackageJson.dependencies,
        localPackageJson.devDependencies
    ));

const removeIgnored = (pair) => R.contains(pair[0]);

const processIgnoreList = (ignoreFile) => ignoreFile
    .catch(() => false)
    .then((ignoreStr) => ignoreStr ? ignoreStr.toString('utf8').split('\n') : [])
    .then(R.map(R.trim))
    .then(R.filter(Boolean));

const extractLimits = (configJson) => configJson
    .then((configJsonStr) => JSON.parse(configJsonStr.toString('utf8')))
    .catch(die('Error! Invalid configuration file'));

const defaultMessages = ({ maxAge, minMaintainers, minVersions }) => ({
    maxAge: `Module ${chalk.yellowBright(`has not been updated in ${maxAge} days`)}`,
    minMaintainers: `Module is maintained by ${chalk.yellowBright(`less than ${minMaintainers} developer(s)`)}`,
    minVersions: `Module has ${chalk.yellowBright(`less than ${minVersions} versions`)}`,
    repoRequired: `Module  ${chalk.yellowBright(`doesn't have a repository listed`)}`
});

const applyRule = ({ maxAge, minMaintainers, minVersions, repoRequired }) => (data) => ({
    maxAge: data.age < maxAge,
    minMaintainers: data.maintainers >= minMaintainers,
    minVersions: data.versions > minVersions,
    repoRequired: data.repository || !repoRequired
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
    return acc.concat([`${chalk.red('Failed validation')} for module ${chalk.white.bold(name, `(${version})`)}`].concat(messages).join('\n'));
}, [], modules);

module.exports = {
    processTargetPackageJson,
    processIgnoreList,
    removeIgnored,
    extractLimits,
    processModules,
    validatePackage
};
