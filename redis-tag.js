var redis = require("redis")

var Taggable = function(taggable){
  this.redisClient = redis.createClient()
  this.taggable = taggable  
}

Taggable.prototype.set = function(id, tags, cb){
  var that = this
  var newList = tags

  // get current tags
  that.redisClient.smembers(that.taggable + ":" + id + ":tags", function(err, reply){

    // keep record of old list
    var oldList = reply ? reply : []

    // make array of tags that need to be added
    var removed = oldList.filter(function(i){ return newList.indexOf(i) == -1 })     

    // make array of tags that need to be removed
    var added   = newList.filter(function(i){ return oldList.indexOf(i) == -1 })     

    // set counters
    var toAddCount    = added.length
    var toRemoveCount = removed.length

    // add new tags
    added.forEach(function(tag){
      that.redisClient.multi()
        .sadd(that.taggable + ":" + id + ":tags", tag)
        .sadd(that.taggable + ":tags:" + tag, id)
        .zincrby(that.taggable + ":tags", 1, tag)
        .exec(function (err, replies) {
          toAddCount --
          if(toAddCount == 0 && toRemoveCount == 0) cb(true)
        })
    })

    // remove the rest
    removed.forEach(function(tag){
      that.redisClient.multi()
        .srem(that.taggable + ":" + id + ":tags", tag)
        .srem(that.taggable + ":tags:" + tag, id)
        .zincrby(that.taggable + ":tags", -1, tag)
        .exec(function (err, replies) {
          // remove tag from system if count is zero
          if(replies[2] == "0"){
            that.redisClient.zrem(that.taggable + ":tags", tag)
          }
          toRemoveCount --
          if(toAddCount == 0 && toRemoveCount == 0) cb(true)
        })
    })

  })

} 

Taggable.prototype.get = function(id, cb){
  this.redisClient.smembers(this.taggable + ":" + id + ":tags", function(err, reply){
    cb(reply)
  })
} 

Taggable.prototype.find = function(tags, cb){
  var sets = []
  var that = this
  
  // set list of arguments
  tags.forEach(function(tag){ sets.push(that.taggable + ":tags:" + tag) })
 
  this.redisClient.sinter(sets, function(err, reply){
    cb(reply)
  })
} 

Taggable.prototype.popular = function(count, cb){
  this.redisClient.zrevrange(this.taggable + ":tags", 0, count -1, "WITHSCORES", function(err, reply){
    var list = []
    var type = "key"
    var tag = []
    var counter = reply.length / 2

    reply.forEach(function(item){
      if(type == "key"){
        type = "value"        
        tag[0] = item
      }else{
        type = "key"        
        tag[1] = parseInt(item)
        list.push(tag)
        tag = []
        counter --
        if(counter == 0) cb(list)
      }
    })
  })
} 

Taggable.prototype.quit = function(){
  this.redisClient.quit()
}

exports.Taggable = Taggable

