const Promise = require('bluebird');
const request = require('request-promise');

const getModuleStats = (moduleName) =>
    request(`https://registry.npmjs.org/${moduleName}`)
        .catch(() => {});

const getModuleDownloads = (moduleName, period) =>
    request(`https://api.npmjs.org/downloads/point/${period}/${moduleName}`)
        .catch(() => {});

const getAllModuleStatsAndDownloads = (period) => (modules) =>
    Promise.map(modules, ([name, version]) => [name, version, getModuleStats(name), getModuleDownloads(name, period)]);

module.exports = {
    getAllModuleStatsAndDownloads
};
