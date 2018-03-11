const parseJson = (json) => {
    try {
        return JSON.parse(json);
    } catch (err) {
        console.log(err.message);
        process.exit();
    }
};

const die = (msg, code = 2) => (err) => {
    console.log(msg);
    console.log(err.message);
    process.exit(code);
};

module.exports = {
    parseJson,
    die
};
