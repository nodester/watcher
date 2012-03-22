#!/usr/bin/env node

/*
 * watcher-kiwf
 * @date:Sun Mar 18 2012 18:37:47 GMT-0600 (CST)
 * @name: watcher.js
 * @licence: MIT
*/
var watcher = module['exports'] = function (options) {
  var bolt = require('bolt');
  var mesh = new bolt.Node({
    delimiter:'::',
    host: options.host || 'localhost',
    port: options.port || 6379,
    auth: options.auth || ''
  });
  mesh.start()
  options = options || {};
  options.maxMemory = options.maxMemory  || -1;
  process.maxMemory = options.maxMemory;
  options.maxUptime = options.maxUptime || -1;
  options.startTime = new Date().getTime();
  process.maxUptime = options.maxUptime;
  options.interval = options.interval || 200;
  function checkConditions() {
    if (options.maxMemory && options.maxMemory !== -1) {
      var mem = process.memoryUsage().rss;
      if (mem >= options.maxMemory) {
        kill('maxMemory has been exceeded.');
      }
    }
    if (options.maxUptime && options.maxUptime !== -1) {
      var currentTime = new Date().getTime();
      if (currentTime - options.startTime >= options.maxUptime) {
        kill('maxUptime has been exceeded.');
      }
    }
  }
  function kill (code) {
    console.log('We detect and abuse of memory in your app, process dieing')
    console.log('process error: ' + code);  
    console.log('app emiting restart signal && dieing...')
    mesh.emit('nodester::dieing',{PID:process.pid, execPath: process.cwd(), port: process.env['app_port']});
    setTimeout(function(){
      process.exit(0);
    },500)
  }
  mesh.on('nodester::kill', function(data){
    console.log('Receiving kill signal by nodester')
    if (process.pid === data.pid){
      kill('Kill by master');
    }
  });
  setInterval(checkConditions, options.interval);
} 