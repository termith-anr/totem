module.exports = {
    "turnoffWebdav": true,
    "debug": true,
    "logFormat": "dev",
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
            "script" : "sentenceAndPara.js",
            "pattern" : "**/*.xml"
        }
    ]
};

module.exports.package = pkg = require('./package.json');