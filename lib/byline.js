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

module.exports.createLineStream = function(readStream) {
  if (!readStream) {
    throw new Error('expected readStream');
  }
  return new LineStream(readStream);
};

function LineStream(readStream) {
  this.writable = false;
  this.readable = true;
  this.readStream = readStream;
  this.buffer = '';

  if (!readStream || !readStream.readable) {
    throw new Error('expected ReadableStream');
  }
  
  var self = this;
  
  this.readStream.on('data', function(data) {    
    if (Buffer.isBuffer(data)) {
      throw new Error('expected encoded stream');
    }
    
    var parts = data.split(/\n|\r\n/g);

    for (var i = 0; i < parts.length -1; i++) {
        self.emit('data', parts[i]);
    }
    
    self.buffer = parts[parts.length - 1];
  });
  
  this.readStream.on('end', function(data) {
    if (self.buffer.length > 0) {
      self.emit('data', self.buffer);
    }
    self.emit('end');
  });
  
}
util.inherits(LineStream, Stream);