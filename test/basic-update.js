var redisTag = require("../redis-tag")
var testCase = require('nodeunit').testCase

var personTagger = new redisTag.Taggable("person")
module.exports = testCase({

  "should set tags on person": function (test) {
    personTagger.set(21, ["hockey", "basketball", "rugby"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should set tags on second person": function (test) {
    personTagger.set(22, ["hockey"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should change tags first person": function (test) {
    personTagger.set(21, ["cricket", "hockey", "football", "baseball"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should get tags for person": function (test) {
    personTagger.get(21, function(tags){
      test.deepEqual(tags.sort(), ["cricket", "hockey", "football", "baseball"].sort())
      test.done()
    })
  },

  "should get hockey as most popular tag": function (test) {
    personTagger.popular(5, function(tags){
      test.ok(tags.length < 6)
      test.deepEqual(tags[0], ["hockey", 2])
      test.done()
    })
  },

  "cleanup": function(test){
    var redis = require("redis")
    var client = redis.createClient()
    client.flushall()
    client.quit()

    personTagger.quit()
    test.done()
  }

})
