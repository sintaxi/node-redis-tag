# redis-tag

Tagging is the perfect job for redis wouldn't you agree? This library makes it
easy to implement a tagging system into any node appication. It has only 4
public methods and sets up all the associations for you. 

## Instalation

I always recomend you bundle your dependencies with your application. To do
this, create a `package.json` file in the root of your project with the minimum
information...

    {
      "name": "yourapplication",
      "verson": "0.0.1",
      "dependencies": {
        "redis-tag": "0.0.3"
      }
    }

Then run the following command using npm...

    npm install

OR, if you just want to start playing with the library run...

    npm install redis-tag

## Usage

To create a taggable object we must first require the library and then
instantiate a new Taggable object. A taggable object can be any model in your
system. For example: book, post, person, etc.

    var redisTag   = require("redis-tag")
    var bookTagger = new redisTag.Taggable("book")

Now we have 4 methods on the `bookTagger` object that give us tagging abilities.

### set(id, tags, callback)

The `set` method applies tags to an `id` (which is your first argument). The id
should correspond with the resource you are tagging. The id does not have to be
an integer but this will usually be the case. `tags` must come in the form of
an array (it is up to your application how this array is formed. redis-tag does
not do this for you). The last argument is a callback with an argument that is 
the response of the `set` call. It will return `true` or `false`.

    // sets tags on book 12
    bookTagger.set(12, ["fiction", "fantasy"], function(response){
      console.log(response) //=> true
    })

### get(id, callback)

The `get` method simply takes an `id` and a callback with a list of tags as the
response. This will always be in the form of an array.

    // gets tags for book 12
    bookTagger.get(12, function(tags){
      console.log(tags) //=> ["fiction", "fantasy"]
    })

### find(tags, callback)

The `find` method will take an array of tags and find all the resources that
have those tags in common. The callback function taken as the second argument
will return with an array of ids.

    // finds resources that have been tagged "fiction"
    bookTagger.find(["fiction"], function(ids){
      console.log(ids) //=> ["12", "27", "42", "18"]
    })

### popular(count, callback)

The `popular` will retrieve all the tags on that resource and order them from
most to least most popular. It accepts an `integer` as its first argument
describing the number of tags you want returned. The `callback` is called with
a `nested array` listing the tags in decending order.

    bookTagger.popular(25, function(tags){
      console.log(tags) //=> [ ["fiction", 27], ["non-fiction", 23], ["fantasy", 15], ... ]
    })

Thats it! have fun.

