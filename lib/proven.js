const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

const die = (msg) => (err) => {
    console.log(msg);
    console.log(err.message);
    process.exit();
};

const readTargetPackageJson = () => readFileAsync('./package.json')
    .catch(die('Error! Not a node project'))
    .then((localPackageJsonStr) => JSON.parse(localPackageJsonStr.toString('utf8')))
    .catch(die('Error! Invalid package.json file'))
    .then((localPackageJson) => Object.assign({}, localPackageJson.dependencies, localPackageJson.devDependencies));

module.exports = {
    die,
    readTargetPackageJson
};
