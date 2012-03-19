var bolt = require('bolt');
var restart = require('lib/app').restart;
var mesh = new bolt.Node({
  delimiter:'::',
  host: options.host || 'localhost',
  port: options.port || 6379,
  auth: options.auth || ''
});
mesh.on('nodester::dieing',function(app){
  var proxytable =require('/path/to/proxy/table.json')
  for (subdomain in proxytable){
    if (proxytable[subdomain]===app.port){
      restart(proxytable[subdomain]);
    }
  }    
})