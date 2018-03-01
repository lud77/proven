const parseJson = (json) => {
    try {
        return JSON.parse(json);
    } catch (err) {
        console.log(err.message);
        process.exit();
    }
};

module.exports = {
    parseJson
};
