# readline-stream -- buffered Stream for reading lines

`byline` is a super-simple module providing a `ReadlineStream` for [node.js](http://nodejs.org/).

This is based on 'byline' transform by @jahewson with modifications from @Tsenzuk.
I've clean-up their code and used a better RegEx that allow to include breaklines
and have a behaviour more similar to Python [readline function](https://docs.python.org/2.4/lib/bltin-file-objects.html)

- node v0.10 `streams2` (transform stream)
- supports `pipe`
- supports both UNIX and Windows line endings
- can be used as a readable-writable "through-stream" (transform stream)

## Install

    npm install readline-stream

or from source:

    git clone git://github.com/piranna/readline-stream.git
	cd readline-stream
	npm link

#Convenience API

The `data` event then emits lines:

```javascript
stream.on('data', function(line) {
  console.log(line);
});
```

#Standard API
    
You just need to add one line to wrap your readable `Stream` with a `ReadlineStream`.

```javascript
var fs = require('fs'),	
    byline = require('readline-stream');

var stream = fs.createReadStream('sample.txt');
stream = stream.pipe(ReadlineStream());

stream.on('data', function(line) {
  console.log(line);
});
```

#Piping

`byline` supports `pipe` while remaining the line endings.

#Transform Stream

The `readline-stream` transform stream can be directly manipulated like so:

```javascript
var LineStream = require('byline').LineStream;

var input = fs.createReadStream('sample.txt');
var output = fs.createWriteStream('nolines.txt');

var lineStream = new ReadlineStream();
input.pipe(lineStream);
lineStream.pipe(output);

```

#Tests

    mocha -R spec


#Simple
Unlike other modules (of which there are many), `readline-stream` contains no:

- monkeypatching
- limitations to only file streams
- CoffeeScript
- mostly unnecessary code
