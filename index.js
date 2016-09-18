"use strict";

const merge = require('mout/object/merge');
const fs   = require('fs');
const untree = require('./untree');
const graph = require('./graph');

var combineSourceMap = require('combine-source-map');

module.exports = function(b) {
  var versions = {}, deps = {};

  b.on("bundle", function(stream) {

    stream.once("end", function() {
      console.log("Wrote map");
      fs.writeFileSync('map.json', JSON.stringify(versions, null, 2));
      fs.writeFileSync('map2.json', JSON.stringify(deps, null, 2));

      deps = untree(deps);
      fs.writeFileSync('map3.json', JSON.stringify(deps, null, 2));

      graph(deps, function(err, body){
        fs.writeFileSync('map.html', body);
      });

    });
  });


  b.on("dep", function(dep){
    var out = merge({}, dep);

    deps[out.id] = out;
    out.size = combineSourceMap.removeComments(out.source).length;
    delete out.source;
  });

    b.on('transform', function (tr, mfile) {
      console.log(mfile);
/*
        console.log(mfile);
        tr.on('file', function (dep) {
            watchFile(mfile, dep);
        });
*/
    });


  b.pipeline.on('package', function (pkg) {
    if(!versions[pkg.name] )
      versions[pkg.name] ={};

    if(!versions[pkg.name][pkg.version]) {
      versions[pkg.name][pkg.version] = [];
      console.log("Loading %s#%s", pkg.name, pkg.version);
    }

    versions[pkg.name][pkg.version].push(pkg.__dirname);
  });


}
