var redisTag = require("../redis-tag")
var testCase = require('nodeunit').testCase

var thingTagger = new redisTag.Taggable("thing")

module.exports = testCase({

  "set things up": function (test){
    thingTagger.set(1, ["foo", "bar", "baz"], function(rsp){
      test.ok(rsp)
      thingTagger.set(2, ["foo"], function(rsp){
        test.ok(rsp)
        thingTagger.set(3, ["foo", "bar"], function(rsp){
          test.ok(rsp)
          test.done()
        })
      })
    })
  },

  "should find 3 books from tag foo": function (test) {
    thingTagger.find(["foo"], function(rsp){
      test.deepEqual(rsp.sort(), ["1", "2", "3"].sort())
      test.done()
    })
  },

  "should find 2 books from tag foo and bar": function (test) {
    thingTagger.find(["foo", "bar"], function(rsp){
      test.deepEqual(rsp.sort(), ["1", "3"].sort())
      test.done()
    })
  },

  "should find 1 books from tag baz": function (test) {
    thingTagger.find(["baz"], function(rsp){
      test.deepEqual(rsp, ["1"])
      test.done()
    })
  },

  "cleanup": function(test){
    var redis = require("redis")
    var client = redis.createClient()
    client.flushall()
    client.quit()

    thingTagger.quit()
    test.done()
  }

})
