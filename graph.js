"use strict";

const fs      = require('fs');
const path    = require('path');


const concat     = require('concat-stream');
const browserify = require('browserify');
const wrap       = require('browserify-wrap');

var style    = fs.readFileSync(path.join(__dirname, 'html/theme.css'), 'utf-8');
var template = fs.readFileSync(path.join(__dirname, 'html/index.html'), 'utf-8');



module.exports = function(data, chain) {

  var standalone = "discify";

  var b = browserify({ standalone });
  b.add(path.join(__dirname, 'html/sequences.js'));
  b.plugin(wrap, { suffix : `${standalone}( ${JSON.stringify(data)} , document.body);` });

  b.bundle().pipe(concat(function (script) {

    var body = template;
    body = body.replace(/&script;/, script);
    body = body.replace(/&style;/, style);

    chain(null, body);
  }));




};
