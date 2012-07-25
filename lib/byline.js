// Copyright (C) 2011 John Hewson
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
  this.buffer = '';
  this.queue = [];
  this.queueMax = 100;
  this.isPaused = false;
}
util.inherits(LineStream, Stream);

LineStream.prototype.write = function(data, encoding) {
  if (Buffer.isBuffer(data)) {
    data = data.toString(encoding || 'utf8');
  }

  var parts = data.split(/\n|\r\n/g);

  if (this.buffer.length > 0) {
    parts[0] = this.buffer + parts[0];
  }

  for (var i = 0; i < parts.length -1; i++) {
    if (!this.isPaused) {
      this.emit('data', parts[i]);
    } else {
      this.queue.push(parts[i]);
    }
  }

  this.buffer = parts[parts.length - 1];

  return this.queue.length <= this.queueMax;
};

LineStream.prototype.end = function() {
  if (!this.isPaused) {
    if (this.buffer.length > 0) {
      this.emit('data', this.buffer);
      this.buffer = '';
    }
    this.emit('end');
  } else {
    if (this.buffer.length > 0) {
      this.queue.push(this.buffer);
      this.buffer = '';
    }
    this.queue.push(null);
  }
};

LineStream.prototype.pause = function() {
  this.isPaused = true;
};

LineStream.prototype.resume = function() {
  this.isPaused = false;
  var line;
  while (this.queue.length && !this.isPaused) {
    line = this.queue.shift();
    if (line !== null) {
      this.emit('data', line);
    } else {
      // EOF
      this.emit('end');
    }
  }
  if (!this.queue.length) {
    this.emit('drain');
  }
};
