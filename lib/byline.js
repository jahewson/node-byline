// Copyright (C) 2011-2013 John Hewson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var stream = require('stream'),
    util = require('util');
    
// convinience API
module.exports = function(readStream, options) {
  return module.exports.createStream(readStream, options);
};

// basic API
module.exports.createStream = function(readStream, options) {
  if (readStream) {
    return createLineStream(readStream, options);
  } else {
    return new LineStream(options);
  }
};

// deprecated API
module.exports.createLineStream = function(readStream) {
  console.log('WARNING: byline#createLineStream is deprecated and will be removed soon');
  return createLineStream(readStream);
};

function createLineStream(readStream, options) {
  if (!readStream) {
    throw new Error('expected readStream');
  }
  if (!readStream.readable) {
    throw new Error('readStream must be readable');
  }
  var ls = new LineStream(options);
  readStream.pipe(ls);
  return ls;
}

//
// using the new node v0.10 "streams2" API
//

module.exports.LineStream = LineStream;

function LineStream(options) {
  stream.Transform.call(this, options);
  this._lineBuffer = [];
}
util.inherits(LineStream, stream.Transform);

LineStream.prototype._transform = function(chunk, encoding, done) {
  // decode binary chunks as UTF-8
  if (Buffer.isBuffer(chunk)) {
    if (encoding == 'buffer') {
      chunk = chunk.toString(); // utf8
    }
    else {
     chunk = chunk.toString(encoding || 'utf8'); 
    }
  }
  
  var lines = chunk.split(/\r\n|\r|\n/g);
  
  if (this._lineBuffer.length > 0) {
    this._lineBuffer[this._lineBuffer.length - 1] += lines[0];
    lines.pop();
  }
  
  this._lineBuffer = this._lineBuffer.concat(lines);
  
  while (this._lineBuffer.length > 1) {
    var line = this._lineBuffer.shift();
    if (!this.push(line)) {
      break;
    }
  }
  
  done();
};

LineStream.prototype._flush = function(done) {
  while (this._lineBuffer.length > 0) {
    var line = this._lineBuffer.shift();
    if (!this.push(line)) {
      break;
    }
  }
  done();
};
