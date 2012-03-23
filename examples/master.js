var bolt = require('bolt');

var mesh = new bolt.Node({
  delimiter:'::',
  host: 'localhost',
  port:  6379,
  silent:true
});
mesh.start()
mesh.on('nodester::dieing',function(app){
 console.log('')
 console.log(app.PID)  
 console.log(app.code)
})
