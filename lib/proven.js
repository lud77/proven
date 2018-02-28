const Promise = require('bluebird');
const fs = require('fs');

const readFileAsync = Promise.promisify(fs.readFile);

const die = (msg, logger) => (err) => {
    logger(msg); // eslint-disable-line no-console
    logger(err.message); // eslint-disable-line no-console
    process.exit();
};

const readTargetPackageJson = () => readFileAsync('./package.json')
    .catch(die('Error! Not a node project'))
    .then((localPackageJsonStr) => JSON.parse(localPackageJsonStr.toString('utf8')))
    .catch(die('Error! Invalid package.json file'))
    .then((localPackageJson) => Object.assign({}, localPackageJson.dependencies, localPackageJson.devDependencies));

module.exports = {
    readTargetPackageJson
};
