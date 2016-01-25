/*jshint node:true, laxcomma:true*/
"use strict";

var ip = process.env.MONGODB_ADDR || "localhost",
	port = process.env.MONGODB_PORT || "27017",
	mongoUrl = 'mongodb://' + ip + ':' + port + '/totem';

module.exports = function(config, run) {
  config.set('theme', __dirname);
  config.set('connectionURI' , mongoUrl);
  config.set('logFormat' , 'dev');
  run();
};

if (!module.parent) {
  require('castor-core')(module.exports);
}
