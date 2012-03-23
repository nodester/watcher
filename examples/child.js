var watcher = (new (require('../lib/watcher'))({
  host:'localhost'
}))


watcher.emitter({
  maxMemory:25 //25mb
})


/*
 
    app.code




 */