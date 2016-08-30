/*jshint node:true, laxcomma:true*/
"use strict";

var url = process.env.EZMASTER_MONGODB_HOST_PORT || "localhost:27017",
	mongoUrl = 'mongodb://' + url + '/totem';
	console.info("mongo URL : " ,mongoUrl);

module.exports = function(config, run) {
  config.set('theme', __dirname);
  config.set('connectionURI' , mongoUrl);
  config.set('logFormat' , 'dev');
  run();
};

if (!module.parent) {
  require('castor-core')(module.exports);
}
