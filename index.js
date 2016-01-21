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
            "script" : "tei-format/scenario1.js",
            "pattern" : "**/*.xml"
        }
    ]
};

module.exports.package = pkg = require('./package.json');