#!/usr/bin/env node

/*
 * watcher
 * Nodester the OpenSource Node.js PaaS
 * @date:Sun Mar 18 2012 18:37:47 GMT-0600 (CST)
 * @name: watcher.js
 * @licence: GNU Affero
*/
var exec = require('child_process').exec
  , http         = require('http')
  , events       = require("events")
  , EventEmitter = events.EventEmitter
  , utils        = require('util')
  , kue          = true
  , endPoint     = {};

var Watcher = function (cfg) {
  if (!(this instanceof Watcher)) return new Watcher(cfg)

  if (!cfg.user || !cfg.password) throw new Error('You need to specified a user && password');
  var auth = 'Basic ' + new Buffer(cfg.user + ':' + cfg.password).toString('base64');
  this.endPoint = endPoint = {
    host: cfg.host||'localhost',
    port: cfg.port || 4001,
    path: cfg.path || '/watcher/audit',
    method: cfg.method ||'PUT',
    headers :{
      "Authorization": auth,
      Host: "www.nodester.com"
    }
  };
  this.codes =  {
      N10:'Quota Exceeded :: Disk Space'
    , N11:'Quota Exceeded :: Memory abuse'
    , N12:'Audit by Master :: Kill signal inmminent'
  }
  console.log('App in audit mode by Watcher...')
  EventEmitter.call(this);

  if (cfg.emitter) return this.emitter(cfg.emitter)
  return this
};

utils.inherits(Watcher, EventEmitter);


Watcher.prototype.emitter = function(options){
  var self = this;
  options = options || {};
  process.maxMemory   = options.maxMemory ? options.maxMemory*1024:-1;
  process.thisBorn    = Date.now();
  process.maxLifeTime = options.maxLifeTime;
  options.interval    = options.interval || 20000;
  process.checkSpace  = options.checkSpace || true;
  process.maxSpace    = options.sizeSpace*1024 || 25000;
  process.endPoint    = this.endPoint || '/env/audit';

  function smash (){
    if (options.maxMemory != -1) {
      var memory = process.memoryUsage().rss;
      if (options.maxMemory >= memory && kue) {
        kue = false
        kill('You reached ' + options.maxMemory + 'Mbs', 'N11');
      }
    }
    if (options.checkSpace){
      exec('du -sk * | sort -rn ', function(error,stdout,stderr){
        if (!error && stderr === ''){
          var size = stdout.split('\n').map(function(row){
            var mem = row.split(' ')[0]
            return !isNaN(parseInt(mem)) ? parseInt(mem): 0;
          });
          // Evil eval is evil, too lazy right now to make the map|forEach|filter function
          var totalSize = eval(size.join('+'));
          if (totalSize >= process.maxSpace && kue){
            kue = false
            kill('There is no space left in for this app, max allowed: ' +  (options.sizeSpace) + 'Mbs','N10')
          }
        }
      });
    }
  }
  function kill (msg,code) {
    console.log('We detect and abuse of memory in your app, process dieing')
    console.log('process error: ' + code)
    var verb = 'stop'
    if (code=='N11') verb = 'restart'
    console.log(msg)
    console.log('app emiting ' + verb + ' signal && dieing...')
    endPoint.body = { 
      PID      : process.pid, 
      execPath : process.cwd(), 
      port     : process.env['app_port']||80,
      code     : code,
      msg      : msg
    }
    self.emit('kill', endPoint.body)
    if (endPoint) {    
     var callout = http.request(endPoint,function(response){
        if (response){
          process.exit(0)
        }
     });
     callout.write(JSON.stringify(endPoint.body))
     callout.on('error', function(err){
        console.error('endPoint is unreacheable, dieing')
        process.exit(0)
     })
     callout.end()
   }
  }
  setInterval(smash, options.interval);
} 


module.exports = Watcher;