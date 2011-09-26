var redis = require("redis")

var Taggable = function(taggable){
  this.redisClient = redis.createClient()
  this.taggable = taggable  
}

Taggable.prototype.scopedSet = function(scope, id, tags, cb){
  var that = this
  var newList = tags

  // get current tags
  that.redisClient.smembers(scope + ":" + that.taggable + ":" + id + ":tags", function(err, reply){
    
    // keep record of old list
    var oldList = reply ? reply : []

    // make array of tags that need to be removed
    var added   = newList.filter(function(i){ return oldList.indexOf(i) == -1 })     

    // make array of tags that need to be added
    var removed = oldList.filter(function(i){ return newList.indexOf(i) == -1 })     

    // set counters
    var toAddCount    = added.length
    var toRemoveCount = removed.length

    // add new tags
    added.forEach(function(tag){
      that.redisClient.multi()
        .sadd(scope + ":" + that.taggable + ":" + id + ":tags", tag)
        .sadd(scope + ":" + that.taggable + ":tags:" + tag, id)
        .zincrby(scope + ":" + that.taggable + ":tags", 1, tag)
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
        .srem(scope + ":" + that.taggable + ":" + id + ":tags", tag)
        .srem(scope + ":" + that.taggable + ":tags:" + tag, id)
        .zincrby(scope + ":" + that.taggable + ":tags", -1, tag)
        .srem(that.taggable + ":" + id + ":tags", tag)
        .srem(that.taggable + ":tags:" + tag, id)
        .zincrby(that.taggable + ":tags", -1, tag)
        .exec(function (err, replies) {
          if(replies[2] == "0")
            that.redisClient.zrem(scope + ":" + that.taggable + ":tags", tag)

          // remove tag from system if count is zero
          if(replies[5] == "0")
            that.redisClient.zrem(that.taggable + ":tags", tag)
          
          toRemoveCount --
          if(toAddCount == 0 && toRemoveCount == 0) cb(true)
        })
    })
    
  })
}

Taggable.prototype.unscopedSet = function(id, tags, cb){
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

Taggable.prototype.set = function(scope, id, tags, cb){
  if(cb){
    this.scopedSet(scope, id, tags, cb)
  }else{
    // cb = tags
    // tags = id
    // id = scope
    this.unscopedSet(scope, id, tags)
  }
} 

Taggable.prototype.get = function(scope, id, cb){
  // scope
  if(cb){
    this.redisClient.smembers(scope + ":" + this.taggable + ":" + id + ":tags", function(err, reply){
      cb(reply)
    })
  }else{
    // cb = id
    // id = scope
    this.redisClient.smembers(this.taggable + ":" + scope + ":tags", function(err, reply){
      id(reply)
    })
  }
} 

Taggable.prototype.find = function(scope, tags, cb){
  var sets = []
  var that = this

  // set list of arguments

  // scope  
  if(cb){
    tags.forEach(function(tag){ sets.push(scope + ":" + that.taggable + ":tags:" + tag) })
  }else{
    // cb = tags
    // tags = scope
    scope.forEach(function(tag){ sets.push(that.taggable + ":tags:" + tag) })
    cb = tags
  }

  this.redisClient.sinter(sets, function(err, reply){
    cb(reply)
  })
} 

Taggable.prototype.popular = function(scope, count, cb){
  // scoped
  if(cb){
    var key = scope + ":" + this.taggable + ":tags"

  // unscoped
  }else{
    cb = count
    count = scope
    var key = this.taggable + ":tags"
  }

  this.redisClient.zrevrange(key, 0, count -1, "WITHSCORES", function(err, reply){
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

