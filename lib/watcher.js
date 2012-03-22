#!/usr/bin/env node

/*
 * watcher
 * @date:Sun Mar 18 2012 18:37:47 GMT-0600 (CST)
 * @name: watcher.js
 * @licence: GNU Affero
*/
var watcher = function (options) {
  var bolt = require('bolt');
  var exec = require('child_process').exec;
  var mesh = new bolt.Node({
    delimiter:'::',
    host: options.host || 'localhost',
    port: options.port || 6379,
    auth: options.auth || ''
  });
  mesh.start()
  options = options || {};
  process.maxMemory = options.maxMemory ? options.maxMemory*1024*1024:-1;
  process.thisBorn = Date.now();
  process.maxLifeTime = options.maxLifeTime;
  options.interval =  options.interval || 200;
  process.checkSpace = options.checkSpace || true;
  process.maxSpace = options.sizeSpace || 25000;
  function smash() {
    if (options.maxMemory != -1) {
      var memory = process.memoryUsage().rss;
      if (memory >= options.maxMemory) {
        kill('You reached '+Math.round((options.maxMemory/1024/1024)+'Mbs',101);
      }
    }
    if (options.checkSpace){
      exec('du -sk * | sort -rn ', function(error,stdout,stderr){
        if (!error && stderr === ''){
          var size = stdout.split('\n').map(function(row){
            var mem =row.split(' ')[0]
            return !isNaN(parseInt(mem)) ? parseInt(mem):0;
          });
          var totalSize =eval(size.join('+')));
          if (totalSize>=options.sizeSpace){
            kill('There is no space left in for this device, max allowed: '+(options.sizeSpace/1024),911)
          }
        }
      });
    }
  }
  function kill (msg,code) {
    console.log('We detect and abuse of memory in your app, process dieing')
    console.log('process error: ' + code);  
    console.log('app emiting restart signal && dieing...')
    mesh.emit('nodester::dieing',{PID:process.pid, execPath: process.cwd(), port: process.env['app_port'],code:code});
    setTimeout(function(){
      process.exit(0);
    },500)
  }
  mesh.on('nodester::kill', function(data){
    console.log('Receiving kill signal by nodester, dieing without restart')
    process.exit(0);
  });
  setInterval(checkConditions, options.interval);
} 