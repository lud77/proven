const Promise = require('bluebird');
const request = require('request-promise');

const registry = 'registry.npmjs.org';

const getModuleStats = (moduleName) =>
    request(`https://${registry}/${moduleName}`)
        .catch((err) => {});

const getAllModuleStats = (modules) => Promise.map(modules, getModuleStats);

module.exports = {
	getModuleStats,
    getAllModuleStats
};
