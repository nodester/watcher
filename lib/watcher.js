#!/usr/bin/env node

/*
 * watcher
 * @date:Sun Mar 18 2012 18:37:47 GMT-0600 (CST)
 * @name: watcher.js
 * @licence: GNU Affero
*/
var exec = require('child_process').exec;
var bolt = require('bolt');
var events = require("events");
var utils = require('util');
kue = true
var Watcher = function (cfg) {
  console.log('App in audit mode by Watcher...')
  this.mesh = new bolt.Node({
    delimiter:'::',
    host: cfg.host || 'localhost',
    port: cfg.port || 6379,
    auth: cfg.auth || '',
    silent:true
  });
  var mesh = this.mesh;
  events.EventEmitter.call(this);
 
};
utils.inherits(Watcher, events.EventEmitter);


Watcher.prototype.emitter = function(options){
  var mesh = this.mesh;
  mesh.start()
  options = options || {};
  process.maxMemory = options.maxMemory ? options.maxMemory*1024:-1;
  process.thisBorn = Date.now();
  process.maxLifeTime = options.maxLifeTime;
  options.interval =  options.interval || 200;
  process.checkSpace = options.checkSpace || true;
  process.maxSpace = options.sizeSpace*1024 || 25000;
  function smash() {
    if (options.maxMemory != -1) {
      var memory = process.memoryUsage().rss;
      if (options.maxMemory>=memory && kue) {
        kue = false
        kill('You reached '+options.maxMemory+'Mbs',101);
      }
    }
    if (options.checkSpace){
      exec('du -sk * | sort -rn ', function(error,stdout,stderr){
        if (!error && stderr === ''){
          var size = stdout.split('\n').map(function(row){
            var mem =row.split(' ')[0]
            return !isNaN(parseInt(mem)) ? parseInt(mem):0;
          });
          // Evil eval is evil, too lazy right now to make the map|forEach|filter function
          var totalSize =eval(size.join('+'));
          if (totalSize>=process.maxSpace && kue){
            kue = false
            kill('There is no space left in for this app, max allowed: '+(options.sizeSpace/1024),911)
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
    // Let's have some time to emit the deing event
    setTimeout(function(){
      process.exit(0);
    },200)
  }
  mesh.on('nodester::kill', function(PID){
    if (PID === process.pid){
      console.log('Receiving kill signal by nodester, dieing without restart')
      process.exit(0);
    } 
  });
  setInterval(smash, options.interval);
} 

Object.defineProperty(Watcher, 'codes', {
  get: function(){
      var code = {
          911:'Quota Exceeded :: Disk Space'
        , 101:'Quota Exceeded :: Memory abuse'
        , 102:'Audit by Master :: Kill signal inmminent'
      }
    return code;
  }
})

module.exports = Watcher;