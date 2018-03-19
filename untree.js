"use strict";

const forOwn = require('mout/object/forOwn');
const sym_registered = Symbol("registered");

module.exports = function(nodes) {

  var modules = {};
  forOwn(nodes, (node) => {
    if(modules[node.module_name])
      return;
    modules[node.module_name] = {
      tree : {
        //[sym_registered] : false,
        name     : node.module_name,
        children : [
          {
            "name" : "files",
            "size" : 0,
          },
          {
            "name" : "node_modules",
            children : []
          },
        ]
      }
    };
  });

  var graph = {name : "root", children : []};

  forOwn(nodes, function(node, id) {
    if(node.dedupeIndex) {
      nodes[id] = nodes[node.dedupeIndex];
      return;
    }
    node.module = modules[node.module_name];
  });


  forOwn(nodes, function(node) {
    if(!(node.entry || node.expose)) //only care for entry node
      return;

    scan(node.id, []);

    graph.children.push(node.module.tree);
  });

  return graph;


  function scan(id, paths) {
    var node = nodes[id];

    if(!node)
      return;

    if(paths.indexOf(id) !== -1 || node.mapped)
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

};
