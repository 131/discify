"use strict";

const fs     = require('fs');
const concat = require('concat-stream');
const browserify = require('browserify');
const path = require('path');

var style    = fs.readFileSync(path.join(__dirname, 'html/theme.css'), 'utf-8');
var template = fs.readFileSync(path.join(__dirname, 'html/index.html'), 'utf-8');


function browser(chain) {
  var b = browserify({
    standalone : "discify"
  });
  b.add(path.join(__dirname, 'html/sequences.js'));
  b.bundle().pipe(concat(function (body) {
    chain(null, body);
  }));
}


module.exports = function(data, chain){

  browser(function(err, code){
    var script = `${code}; discify( ${JSON.stringify(data)} , document.body);`;

    var body  = template;

    body = body.replace(/&script;/, script);
    body = body.replace(/&style;/, style);

    chain(null, body);
    
  })

};