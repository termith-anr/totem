module.exports = {
    "routes": [
        {
            "path" : "/search/:xmlid?/:page?",
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
    ],
     "documentFields" : {
        "$text": {
            "get" : "content.json.TEI.stdf.spanGrp.1.span",
            "foreach": {
                "$targetAndAna" : {
                    "template" : "{{target}}//{{ana}}//{{corresp}}//{{lemma}}"
                },
                "find" : "targetAndAna"
                  }
        }
    }
};

module.exports.package = pkg = require('./package.json');
