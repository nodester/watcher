(new (require('../lib/watcher'))({
  host:'localhost'
})).emitter({
  maxMemory:25, //25mb,
  sizeSpace:25,
  checkSpace:true
})

require('http').createServer(function(req,res){
  res.end('pl')
}).listen(9011)

/*
 
    app.code




 */