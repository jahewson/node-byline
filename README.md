# byline -- buffered Stream for reading lines

`byline` is an insanely simple module providing a `LineStream` for [node.js](http://nodejs.org/).

- supports `pipe`
- supports both UNIX and Windows line endings
- wraps any readable stream
- super-simple: `stream = byline.createLineStream(stream);`

## Install

    npm install byline

or from source:

    git clone git://github.com/jahewson/node-byline.git
	cd request
	npm link

#Example
    
You just need to add one line to wrap your readable `Stream` with a `LineStream`. The stream must have a non-null encoding.

    var fs = require('fs'),	
        byline = require('byline');

	var stream = fs.createReadStream('sample.txt', {encoding:'utf8'});
	
	// this is the only line you need to add:
	stream = byline.createLineStream(stream);

	stream.on('data', function(line) {
	  console.log(line);
	});

#Pipe

`byline` plays nice with `pipe`, but don't forget it strips the line endings.

    var stream = fs.createReadStream('sample.txt', {encoding:'utf8'});
	stream = byline.createLineStream(stream);
	stream.pipe(fs.createWriteStream('nolines.txt'));

#Awesome
Unlike other modules (of which there are many), `byline` contains absolutely no:

- X - monkeypatching
- X - dependencies
- X - non-standard 'line' events which break `pipe`
- X - limitations to only file streams
- X - CoffeeScript (sorry)
- X -  mostly unnecessary code