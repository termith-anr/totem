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
            "script" : "speedUnsecured.js",
            "pattern" : "**/*.xml"
        }
    ]
};

module.exports.package = pkg = require('./package.json');