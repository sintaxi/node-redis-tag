var redisTag = require("../redis-tag")
var bookTagger = new redisTag.Taggable("book")
var redis = require("redis")
var client = redis.createClient()


bookTagger.set(1, ["javascript", "server", "programming"], function(rsp){

  console.time('10,000 - gets')
  for (var i = 0; i < 10000; i++)(function(i){
    bookTagger.get(1, function(tags){
      if(i == 9999){
        console.timeEnd('10,000 - gets');
        client.flushall()
        client.quit()
        bookTagger.quit()
      }
    })
  })(i)

})

