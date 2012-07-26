// Copyright (C) 2011-2012 John Hewson
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

var Stream = require('stream').Stream,
    util = require('util');
    
// convinience API
module.exports = function(readStream) {
  return module.exports.createStream(readStream);
};

// new API
module.exports.createStream = function(readStream) {
  if (readStream) {
    return module.exports.createLineStream(readStream);
  } else {
    return new LineStream();
  }
};

// deprecated API
module.exports.createLineStream = function(readStream) {
  if (!readStream) {
    throw new Error('expected readStream');
  }
  if (!readStream.readable) {
    throw new Error('readStream must be readable');
  }
  if (readStream.encoding === null) {
    throw new Error('readStream must have non-null encoding');
  }
  var ls = new LineStream();
  readStream.pipe(ls);
  return ls;
};

function LineStream() {
  this.writable = true;
  this.readable = true;
  
  var source;
  var buffer = '';
  var self = this;
  
  this.write = function(data, encoding) {
    if (Buffer.isBuffer(data)) {
      data = data.toString(encoding || 'utf8');
    }

    var parts = data.split(/\n|\r\n/g);

    if (buffer.length > 0) {
      parts[0] = buffer + parts[0];
    }

    for (var i = 0; i < parts.length -1; i++) {
      self.emit('data', parts[i]);
    }

    buffer = parts[parts.length - 1];
  };

  this.end = function() {
    if (buffer.length > 0) {
      self.emit('data', buffer);
    }
    self.emit('end');
  };

  this.on('pipe', function(src) {
    source = src;
  });
  
  this.pause = function() {
    if (!source) {
      throw new Error('pause() only supported when a LineStream is piped into');
    }
    source.pause();
  };
  
  this.resume = function() {
    if (!source) {
      throw new Error('resume() only supported when a LineStream is piped into');
    }
    source.resume();
  };
}
util.inherits(LineStream, Stream);