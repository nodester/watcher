#!/usr/bin/env node

/*
 * watcher
 * @date:Sun Mar 18 2012 18:37:47 GMT-0600 (CST)
 * @name: watcher.js
 * @licence: MIT
*/


var http = require('http');

var app = http.createServer(function(req,res){
   res.end('I\'m watcher, and you');
});


function run(port) {
  port = port || 8000;
  app.listen(port, function() {
    console.log('running on port: '+port);
  });
};
module.exports.run = run;
