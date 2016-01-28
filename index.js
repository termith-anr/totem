module.exports = {
    "routes": [
        {
            "path" : "/search/:xmlid?/:page?",
            "value" : "search.js",
            "method" : "get"
        },
        {
            "path" : "/getpar/:wid",
            "value" : "getpar.js",
            "method" : "get"
        }
    ],
    "loaders" : [
        {
            "script" : "castor-load-raw",
            "pattern" : "**/*.xml"
        },
        {
            "script" : "new.js",
            "pattern" : "**/*.xml"
        }
    ]
};

module.exports.package = pkg = require('./package.json');