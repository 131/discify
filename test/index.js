"use strict";

const expect  = require("expect.js");
const discify = require('../');


describe("full integration suite", function(){
  it("should generate a nice graph", function(){

      var b = browserify();
      b.add();

      b.plugin(discify);
      var out = b.bundle();
      out.on('data', Function.prototype); //discard

      var challenge = fs.createWriteStream("challenge.png");
      out.on('end', function(){
        rasterize("out/disc.html", {
          type   : "png",
          width  : 600,
          height : 600,
        }, function(err, stream){
          stream.pipe(challenge);
          stream.on("end", function(){
            console.log("done");
          });

        })
      });
  })

});