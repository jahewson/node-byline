// Based on 'byline' transform from John Hewson

var Transform = require('stream').Transform;

var inherits = require('inherits');


var splitting_re = /.*?(?:\r\n|\r|\n)|.*?$/g;
//var splitting_re = /.*?(?:\r\n|\r|\n)|.+?$|^$/g;


function ReadlineStream(options)
{
  if(!(this instanceof ReadlineStream))
    return new ReadlineStream(options);

  ReadlineStream.super_.call(this, options)


  // use objectMode to stop the output from being buffered
  // which re-concatanates the lines, just without newlines.
  this._readableState.objectMode = true;

  var lineBuffer = '';

  // take the source's encoding if we don't have one
  this.on('pipe', function(src) {
    if (!this.encoding) {
      this.encoding = src._readableState.encoding;
    }
  });

  this._transform = function(chunk, encoding, done)
  {
    // decode binary chunks as UTF-8
    if(Buffer.isBuffer(chunk))
    {
      if(!encoding || encoding == 'buffer') encoding = 'utf8';

      chunk = chunk.toString(encoding);
    }

    lineBuffer += chunk;
    var lines = lineBuffer.match(splitting_re);

    while(lines.length > 1)
      this.push(lines.shift())

    lineBuffer = lines[0] || '';

    done();
  };

  this._flush = function(done)
  {
    if(lineBuffer)
    {
      this.push(lineBuffer)
      lineBuffer = ''
    }

    done();
  };
}
inherits(ReadlineStream, Transform);


module.exports = ReadlineStream;
