/*
 * Mocha tests, run with `mocha -R spec`
 * (c) 2013 John Hewson
 * MIT License
 */

var assert = require("assert"),
    fs = require('fs'),
    byline = require('../lib');

describe('byline', function() {
  
  it('should pipe a small file', function(done) {
    var input = fs.createReadStream('LICENSE');
    var lineStream = byline(input); // convinience API
    var output = fs.createWriteStream('test.txt');
    lineStream.pipe(output);
    output.on('close', function() {
      var out = fs.readFileSync('test.txt', 'utf8');
      var in_ = fs.readFileSync('LICENSE', 'utf8').replace(/\n/g, '');
      assert.equal(in_, out);
      fs.unlinkSync('test.txt');
      done();
    });
  });
  
  it('should ignore empty lines', function(done) {
    var input = fs.createReadStream('test/empty.txt');
    var lineStream = byline(input);
    lineStream.setEncoding('utf8');
    
    var lines1 = [];
    lineStream.on('data', function(line) {
      lines1.push(line);
    });
    
    lineStream.on('end', function() {
      var lines2 = fs.readFileSync('test/empty.txt', 'utf8').split(/\r\n|\r|\n/g);
      lines2 = lines2.filter(function(line) {
        return line.length > 0;
      });
      assert.deepEqual(lines2, lines1);
      done();
    });
  });

  it('should do not ignore empty lines', function(done) {
    var input = fs.createReadStream('test/empty.txt');
    var lineStream = byline(fs.createReadStream('test/empty.txt'), {
        skipEmptyLines: false,
        encoding: 'utf8'
    });
    
    var lines1 = [];
    lineStream.on('data', function(line) {
      lines1.push(line);
    });    
    lineStream.on('end', function() {
      var lines2 = fs.readFileSync('test/empty.txt', 'utf8').split(/\r\n|\r|\n/g);
      assert.deepEqual(lines2, lines1);
      done();
    });
  });
    
   it('should read a large file', function(done) {
    var input = fs.createReadStream('test/rfc.txt');
    var lineStream = byline(input);
    lineStream.setEncoding('utf8');

    var lines2 = fs.readFileSync('test/rfc.txt', 'utf8').split(/\r\n|\r|\n/g);
    lines2 = lines2.filter(function(line) {
      return line.length > 0;
    });
    
    var lines1 = [];
    var i = 0;
    lineStream.on('data', function(line) {
      lines1.push(line);
      if (line != lines2[i]) {
        console.log('EXPECTED:', lines2[i]);
        console.log('     GOT:', line);
        assert.fail(null, null, 'difference at line ' + (i + 1));
      }
      i++;
    });
    
    lineStream.on('end', function() {
      assert.equal(lines2.length, lines1.length);
      assert.deepEqual(lines2, lines1);
      done();
    });
  });
  
  it('should pause() and resume()', function(done) {
    var input = fs.createReadStream('LICENSE');
    var lineStream = byline(input);
    lineStream.setEncoding('utf8');

    var lines2 = fs.readFileSync('LICENSE', 'utf8').split(/\r\n|\r|\n/g);
    lines2 = lines2.filter(function(line) {
      return line.length > 0;
    });
    
    var lines1 = [];
    var i = 0;
    lineStream.on('data', function(line) {
      lines1.push(line);
      if (line != lines2[i]) {
        console.log('EXPECTED:', lines2[i]);
        console.log('     GOT:', line);
        assert.fail(null, null, 'difference at line ' + (i + 1));
      }
      i++;
      
      // pause/resume
      lineStream.pause();
      setTimeout(function() {
        lineStream.resume();
      }, 0);
    });
    
    lineStream.on('end', function() {
      assert.equal(lines2.length, lines1.length);
      assert.deepEqual(lines2, lines1);
      done();
    });
  });
  
});