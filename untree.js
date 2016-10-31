"use strict";


const startsWith = require('mout/string/startsWith');
const forOwn = require('mout/object/forOwn');
const path   = require('path');

const lookup  = require('nyks/require/lookup');

var sym_registered = Symbol("registered");


module.exports = function(nodes) {

  forOwn(nodes, function(node, id) {

    if(node.dedupeIndex) {
      nodes[id] = nodes[node.dedupeIndex];
      return;
    }

    var module = lookup(node.file);
    node.module_name = `${module.name}-${module.version}`;
    node.module = module;

    if(!module.tree)
      module.tree = {
        //[sym_registered] : false,
        name     : node.module_name,
        children : [
          {
            "name": "files",
            "size" : 0,
          },
          {
            "name": "node_modules",
            children : []
          },
        ]
      };
  });

  var out = {name:"root", children : []};

  forOwn(nodes, function(node) {
    if(!node.entry) //only care for entry node
      return;
    var tmp = scan(node.id, []);

    out.children.push(node.module.tree);
  });

  return out;


  function scan(id, paths) {
    var node = nodes[id];

    if(!node)
      return;
    if(!node || paths.indexOf(id) !== -1 || node.mapped)
      return node.module.tree;


    paths.push(id);
    node.mapped = true;

    node.module.tree.children[0].size += node.size;

    //console.error("Scanning", id, node.file);
    forOwn(node.deps, function(childId) {
      var subtree = scan(childId, paths);

      if(!subtree || subtree[sym_registered] || subtree == node.module.tree || node.module.tree.children[1].children.indexOf(subtree) != -1)
        return;

      subtree[sym_registered] = true;

      node.module.tree.children[1].children.push(subtree);

    });

    return node.module.tree;
  }

}