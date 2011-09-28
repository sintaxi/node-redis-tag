var redisTag = require("../redis-tag")
var bookTagger = new redisTag.Taggable("book")
var redis = require("redis")
var client = redis.createClient()

console.time('10,000-taggings');

for (var i = 0; i < 10000; i++)(function(i){
  bookTagger.set(i, ["javascript", "server", "programming"], function(rsp){
    if(i == 9999){
      console.timeEnd('10,000-taggings');
      client.flushall()
      client.quit()
      bookTagger.quit()
    }
  })
})(i)


