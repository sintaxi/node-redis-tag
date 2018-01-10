# redis-tag

Tagging is the perfect job for Redis, wouldn't you agree? This library makes it
easy to implement a tagging system into any node appication. It has only 4
public methods and sets up all the associations for you. 

## Installation

I always recommend you bundle your dependencies with your application. To do
this, create a `package.json` file in the root of your project with the minimum
information...

    {
      "name": "yourapplication",
      "verson": "0.0.1",
      "dependencies": {
        "redis-tag": "0.2.0"
      }
    }

Then run the following command using npm...

    npm install

OR, if you just want to start playing with the library run...

    npm install redis-tag

## Docs

To create a taggable object we must first require the library and then
instantiate a new Taggable object. A taggable object can be any model in your
system. For example: book, post, person, etc.

    var redisTag   = require("redis-tag")
    var bookTagger = new redisTag.Taggable("book")

Now we have 4 methods on the `bookTagger` object that give us tagging abilities.

### set([scope,] id, tags, callback)

The `set` method applies tags to an `id` (which is your first argument). The id
should correspond with the resource you are tagging. The id does not have to be
an integer but this will usually be the case. `tags` must come in the form of
an array (it is up to your application how this array is formed. redis-tag does
not do this for you). The last argument is a callback with an argument that is
the response of the `set` call. It will return `true` or `false`. `scope` is an
optional argument for if you want to do something like delicious where eash
user has their own set of tags. If a `scope` is used when tagging. you still
have avaiable to you all the other methods in a non-scoped or scoped manner.

    // sets tags on book 12
    bookTagger.set(12, ["fiction", "fantasy"], function(response){
      console.log(response) //=> true
    })

#### OR (with scope)

    // sets tags on book 12 for user 42
    bookTagger.set("user:42", 12, ["fiction", "fantasy"], function(response){
      console.log(response) //=> true
    })

### get([scope,] id, callback)

The `get` method simply takes an `id` and a callback with a list of tags as the
response. This will always be in the form of an array.

    // gets tags for book 12
    bookTagger.get(12, function(tags){
      console.log(tags) //=> ["fiction", "fantasy"]
    })

#### OR (with scope)

Please note that this is only effective if you have used a scope on the `set`
method.

    // gets tags for book 12
    bookTagger.get("user:42", 12, function(tags){
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

#### OR (with scope)

Please note that this is only effective if you have used a scope on the `set`
method.

    // finds resources that have been tagged "fiction"
    bookTagger.find("user:42", ["fiction"], function(ids){
      console.log(ids) //=> ["12", "27", "42", "18"]
    })

### popular(count, callback)

The `popular` will retrieve all the tags on that resource and order them from
most to least most popular. It accepts an `integer` as its first argument
describing the number of tags you want returned. The `callback` is called with
a `nested array` listing the tags in decending order.

    bookTagger.popular(25, function(tags){
      console.log(tags) //=> [ ["fiction", 892], ["non-fiction", 423], ["fantasy", 315], ... ]
    })

#### OR (with scope)

Please note that this is only effective if you have used a scope on the `set`
method.

    bookTagger.popular("user:42", 25, function(tags){
      console.log(tags) //=> [ ["fiction", 27], ["non-fiction", 23], ["fantasy", 15], ... ]
    })

## License

Copyright 2011 Brock Whitten
All rights reserved.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
