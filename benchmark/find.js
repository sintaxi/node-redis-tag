var redisTag = require("../redis-tag")
var bookTagger = new redisTag.Taggable("book")
var redis = require("redis")
var client = redis.createClient()

bookTagger.set(1, ["javascript", "server", "programming"], function(rsp){
  bookTagger.set(2, ["server", "programming"], function(rsp){
    bookTagger.set(3, ["javascript", "programming"], function(rsp){

      console.time('10,000 - finds')
      for (var i = 0; i < 10000; i++)(function(i){
        bookTagger.find(["programming", "server"], function(tags){
          if(i == 9999){
            console.timeEnd('10,000 - finds');
            client.flushall()
            client.quit()
            bookTagger.quit()
          }
        })
      })(i)

    })
  })
})

