var redisTag = require("../redis-tag")
var testCase = require('nodeunit').testCase

var bookTagger = new redisTag.Taggable("book")
module.exports = testCase({

  // book                 tags
  // 1 - node             [javascript, server, programming]
  // 2 - jquery           [javascript, client, programming]
  // 3 - rails            [ruby, server, programming]
  // 4 - coffeescript     [javascript, client, server, programming]

  "should set tags on book 1": function (test) {
    bookTagger.set(1, ["javascript", "server", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should get tags for book 1": function (test) {
    bookTagger.get(1, function(rsp){
      test.deepEqual(rsp.sort(), ["javascript", "server", "programming"].sort())
      test.done()
    })
  },

  "should set tags on book 2": function (test) {
    bookTagger.set(2, ["javascript", "client", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should get tags for book 2": function (test) {
    bookTagger.get(2, function(rsp){
      test.deepEqual(rsp.sort(), ["javascript", "client", "programming"].sort())
      test.done()
    })
  },

  "should set tags on book 3": function (test) {
    bookTagger.set(3, ["ruby", "server", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should get tags for book 3": function (test) {
    bookTagger.get(3, function(rsp){
      test.deepEqual(rsp.sort(), ["ruby", "server", "programming"].sort())
      test.done()
    })
  },

  "should set tags on book 4": function (test) {
    bookTagger.set(4, ["javascript", "client", "server", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },
  
  "should get tags for book 4": function (test) {
    bookTagger.get(4, function(rsp){
      test.deepEqual(rsp.sort(), ["javascript", "client", "server", "programming"].sort())
      test.done()
    })
  },

  "should find books from tag": function (test) {
    bookTagger.find(["client"], function(rsp){
      test.deepEqual(rsp.sort(), ["2", "4"].sort())
      test.done()
    })
  },

  "should get most popular tags": function (test) {
    bookTagger.popular(10, function(rsp){
      test.deepEqual(rsp[0], ["programming", 4])
      test.done()
    })
  },

  "cleanup": function(test){
    var redis = require("redis")
    var client = redis.createClient()
    client.flushall()
    client.quit()

    bookTagger.quit()
    test.done()
  }

})
