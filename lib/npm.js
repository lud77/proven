const request = require('request-promise');

const registry = 'registry.npmjs.org';

module.exports = () => {
    const getModuleStats = (moduleName) =>
		request(`https://${registry}/${moduleName}`)
			.catch((err) => {});

	return {
		getModuleStats
	};
};
