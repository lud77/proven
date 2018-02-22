const request = require('request-promise');

const registry = 'registry.npmjs.org';

const getModuleStats = (moduleName) =>
    request(`https://${registry}/${moduleName}`)
        .catch((err) => {});

module.exports = {
	getModuleStats
};
