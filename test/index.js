"use strict";

const fs    = require('fs');
const path  = require('path');


const generate = require('../template');

const mock_path  = path.join(__dirname, 'mock.json');
const mock = JSON.parse(fs.readFileSync(mock_path));


generate(mock, function(err, body){
  fs.writeFileSync("test.html", body);
});

