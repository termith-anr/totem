module.exports = {
    "routes": [
        {
            "path" : "/search/:xmlid",
            "value" : "search.js",
            "method" : "get"
        }
    ],
    "loaders" : [
        {
            "script" : "castor-load-xml",
            "pattern" : "**/*.xml"
        },
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
