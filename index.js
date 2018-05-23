"use strict";

const fs     = require('fs');
const path   = require('path');

const merge            = require('mout/object/merge');
const combineSourceMap = require('combine-source-map');
const mkdirpSync       = require('nyks/fs/mkdirpSync');
const lookup           = require('nyks/require/lookup');
const forOwn           = require('mout/object/forOwn');
const isFileSync       = require('nyks/fs/isFileSync');

const untree  = require('./untree');
const console = {
  log : require('debug')('discify')
};

const graph  = require('./graph');

module.exports = function(b, opts) {

  var versions = {};
  var deps = {};

  opts = Object.assign({
    outdir : 'disc'
  }, opts);

  var outdir = mkdirpSync(opts.outdir);

  b.once("bundle", function(stream) {
    stream.once("end", function() {
      console.log("Wrote map");

      fs.writeFileSync(path.join(outdir, 'packages.json'), JSON.stringify(versions, null, 2));
      fs.writeFileSync(path.join(outdir, 'browserify-deps.json'), JSON.stringify(deps, null, 2));

      //discify.io doesn't need to know about your fs
      forOwn(deps, (node) => {
        if(node.expose && !isFileSync(node.file))
          node.file = require.resolve(node.file);
        var module = lookup(node.file);
        node.module_name = `${module.name}-${module.version}`;
        delete node.file;
      });

      fs.writeFileSync(path.join(outdir, 'deps.json'), JSON.stringify(deps, null, 2));
      //deps contain un-processed module dependencies from browserify
      deps = untree(deps);
      fs.writeFileSync(path.join(outdir, 'graph.json'), JSON.stringify(deps, null, 2));

      graph(deps, function(err, body) {
        deps = {}; //reset dependency graph until next round
        fs.writeFileSync(path.join(outdir, 'map.html'), body);
        b.emit("discified");
      });

    });
  });

  b.on("dep", function(dep) {
    var out = merge({}, dep);
    deps[out.id] = out;
    out.size = combineSourceMap.removeComments(out.source).length;
    delete out.source;
  });

  b.pipeline.on('package', function (pkg) {
    if(!versions[pkg.name])
      versions[pkg.name] = {};

    if(!versions[pkg.name][pkg.version]) {
      versions[pkg.name][pkg.version] = [];
      console.log("Loading %s#%s", pkg.name, pkg.version);
    }

    versions[pkg.name][pkg.version].push(pkg.__dirname);
  });


};
