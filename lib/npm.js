const Promise = require('bluebird');
const request = require('request-promise');

const registry = 'registry.npmjs.org';

const getModuleStats = (moduleName) =>
    request(`https://${registry}/${moduleName}`)
        .catch((err) => {});

const getAllModuleStats = (modules) =>
    Promise.map(modules, ([name, version]) => [name, version, getModuleStats(name)]);

module.exports = {
	getModuleStats,
    getAllModuleStats
};
