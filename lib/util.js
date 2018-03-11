const parseJson = (json) => {
    try {
        return JSON.parse(json);
    } catch (err) {
        console.log(err.message);
        process.exit();
    }
};

const dieFactory = (logger) => (msg) => (err) => {
    logger(msg);
    logger(err.message);
    process.exit();
};

module.exports = {
    parseJson,
    dieFactory
};
