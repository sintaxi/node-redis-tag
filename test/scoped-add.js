var redisTag = require("../redis-tag")
var testCase = require('nodeunit').testCase

var bookTagger = new redisTag.Taggable("book")

// person         book                 tags
// user:27        1 - node             [javascript, server, programming]
// user:27        2 - jquery           [javascript, client, programming]
// user:42        3 - rails            [ruby, server, programming]
// user:42        4 - coffeescript     [coffeescript, server, client]
// user:42        1 - node             [javascript, server, programming, async, joyent]

module.exports = testCase({

  "should set tags on book 1": function (test) {
    bookTagger.set("user:27", 1, ["javascript", "server", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should get tags for book 1": function (test) {
    bookTagger.get("user:27", 1, function(rsp){
      test.deepEqual(rsp.sort(), ["javascript", "server", "programming"].sort())
      test.done()
    })
  },

  "should set tags on book 2": function (test) {
    bookTagger.set("user:27", 2, ["javascript", "client", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should get tags for book 2": function (test) {
    bookTagger.get("user:27", 2, function(rsp){
      test.deepEqual(rsp.sort(), ["javascript", "client", "programming"].sort())
      test.done()
    })
  },

  "should set tags on book 3": function (test) {
    bookTagger.set("user:42", 3, ["ruby", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },

  "should get tags for book 3": function (test) {
    bookTagger.get("user:42", 3, function(rsp){
      test.deepEqual(rsp.sort(), ["ruby", "programming"].sort())
      test.done()
    })
  },

  "should set tags on book 4": function (test) {
    bookTagger.set("user:42", 4, ["javascript", "client", "server", "programming"], function(rsp){
      test.ok(rsp)
      test.done()
    })
  },
  
  "should get tags for book 4": function (test) {
    bookTagger.get("user:42", 4, function(rsp){
      test.deepEqual(rsp.sort(), ["javascript", "client", "server", "programming"].sort())
      test.done()
    })
  },

  "should get empty array if book has not been tagged": function (test) {
    bookTagger.get("user:42", 99, function(rsp){
      test.deepEqual(rsp, [])
      test.done()
    })
  },

  "should find books from tag": function (test) {
    bookTagger.find("user:42", ["client"], function(rsp){
      test.deepEqual(rsp.sort(), ["4"].sort())
      test.done()
    })
  },

  "should get empty array for non existing tag": function (test) {
    bookTagger.find("user:42", ["maytag"], function(rsp){
      test.deepEqual(rsp, [])
      test.done()
    })
  },

  "should get all items if no tags specified": function (test) {
    bookTagger.find("user:42", [], function(rsp){
      test.equal(rsp, undefined)
      test.done()
    })
  },

  "should get most popular tags": function (test) {
    bookTagger.popular("user:42", 10, function(rsp){
      test.deepEqual(rsp[0], ["programming", 2])
      test.done()
    })
  },

  "global":{
    "should get most popular tags": function (test) {
      bookTagger.popular(10, function(rsp){
        test.deepEqual(rsp[0], ["programming", 4])
        test.done()
      })
    }
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
