"use strict";

const fs     = require('fs');
const concat = require('concat-stream');
const browserify = require('browserify');

var style    = fs.readFileSync('html/theme.css', 'utf-8');
var template = fs.readFileSync('html/index.html', 'utf-8');


function browser(chain) {
  var b = browserify({
    standalone : "discify"
  });
  b.add('./html/sequences.js');
  b.bundle().pipe(concat(function (body) {
    chain(null, body);
  }));
}


module.exports = function(data, chain){

  browser(function(err, code){

    var script = ` ${code}; 

        discify( ${JSON.stringify(data)} , document.body);`;

    template = template.replace(/&script;/, script);
    template = template.replace(/&style;/, style);

    chain(null, template);
    
  })

};