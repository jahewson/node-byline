var byline = require('../lib/byline'),
    fs = require('fs');
    
// stream API

var input = fs.createReadStream('LICENSE');

var lineStream = byline(input); // convinience API

var output = fs.createWriteStream('test.txt');
lineStream.pipe(output);
