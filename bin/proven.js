const { promisify } = require('util');
const Promise = require('bluebird');
const options = require('commander');
const fs = require('fs');
const R = require('ramda');

const readFileAsync = promisify(fs.readFile);

const packageJson = require('../package.json');

options
	.version(packageJson.version)
	.parse(process.argv);

const ignore = './.provenignore';
const package = './package.json';

const parseJson = (stringified) => {
	try {
		return JSON.parse(stringified);
	} catch (e) {
		return {};
	};
};

Promise.map([
	readFileAsync(ignore, { encoding: 'utf8' }),
	readFileAsync(package, { encoding: 'utf8' })
]).then(([ignoreContent, packageContent]) => {
	const ignoreList = ignoreContent.split('\n');
	const package = parseJson(packageContent);
	const dependencies = R.path(['dependencies'], package) || [];
	const devDependencies = R.path(['devDependencies'], package) || [];
	const modules = dependencies.concat(devDependencies);
	return R.reject((item) => ignoreList.includes(item), modules);
}).then((toCheck) => {
	console.log('List of modules', toCheck);
}).catch((e) => {
	console.log('An error occurred', e);
});
