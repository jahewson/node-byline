# byline -- buffered Stream for reading lines

`byline` is a super-simple module providing a `LineStream` for [node.js](http://nodejs.org/).

- supports `pipe`
- supports both UNIX and Windows line endings
- can wrap any readable stream
- can be used as a readable-writable "through-stream"
- super-simple: `stream = byline(stream);`

## Install

    npm install byline

or from source:

    git clone git://github.com/jahewson/node-byline.git
	cd node-byline
	npm link

#Convenience API

The `byline` module can be used as a function to quickly wrap a readable stream:

```javascript
var fs = require('fs'),
    byline = require('byline');

var stream = byline(fs.createReadStream('sample.txt'));
```

The `data` event then emits lines:

```javascript
stream.on('data', function(line) {
  console.log(line);
});
```

#Standard API
    
You just need to add one line to wrap your readable `Stream` with a `LineStream`.

```javascript
var fs = require('fs'),	
    byline = require('byline');

var stream = fs.createReadStream('sample.txt');
stream = byline.createStream(stream);

stream.on('data', function(line) {
  console.log(line);
});
```

#Piping

`byline` supports `pipe` (though it strips the line endings, of course).

```javascript
var stream = fs.createReadStream('sample.txt');
stream = byline.createLineStream(stream);
stream.pipe(fs.createWriteStream('nolines.txt'));
```

Alternatively, you can create a readable/writable "through-stream" which doesn't wrap any specific stream:

```javascript
var stream = fs.createReadStream('sample.txt');
stream = byline.createLineStream(stream);
stream.pipe(fs.createWriteStream('nolines.txt'));
	
var input = fs.createReadStream('LICENSE');
var lineStream = byline.createStream();
input.pipe(lineStream);

var output = fs.createWriteStream('test.txt');
lineStream.pipe(output);
```

#Simple
Unlike other modules (of which there are many), `byline` contains no:

- monkeypatching
- dependencies
- non-standard 'line' events which break `pipe`
- limitations to only file streams
- CoffeeScript
- mostly unnecessary code