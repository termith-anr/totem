/*
 * Created by matthias on 26/02/15.
 * VERSION: Scenario 1
 */
 'use strict';

// Required modules
var objectPath = require('object-path'),
    sha1 = require('sha1'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    $;

module.exports = function(options,config) {
  options = options || {};
  config = config.get() || {};
  return function (input, submit) {
    // Execute this loader only for this format given in json config file
    if(config.teiFormat === "scenario1") {

      /************************
       ****   EXECUTION    ****
       ************************/

      //Load Cheerio on xml DOC input

      $ = cheerio.load(input.content.xml.toString(), {
        normalizeWhitespace: true,
        xmlMode: true
      });

      // var words = (jsonselect.match('.titleStmt .title :has(:root > .type:val("main")) .w' ,  input.content.json)).length > 0 ? jsonselect.match('.titleStmt .title :has(:root > .type:val("main")) .w' ,  input.content.json) : jsonselect.match('.titleStmt .title .w' ,  input.content.json) ,
      //     pc    = (jsonselect.match('.titleStmt .title :has(:root > .type:val("main")) .pc' ,  input.content.json)).length > 0 ? jsonselect.match('.titleStmt .title :has(:root > .type:val("main")) .pc' ,  input.content.json) : jsonselect.match('.titleStmt .title .pc' ,  input.content.json),
      //     title;

      console.info(" Nom : "  , input.basename);

      var list  = [],
          obj = {},
          words = $('spanGrp[type="candidatsTermes"] span').filter('[target],[corresp],[ana~="#DM4"],[ana~="#DAOn"]'),
          firstWord,
          endWord,
          para,
          sentence,
          target,
          corresp,
          lemma,
          prevAllW,
          nextAllW,
          prevW,
          nextW;

       console.info("Il y a  : " , words.length , " span");

      // For each span
      for (var i = 0; i < words.length; i++) {
        target = $(words[i]).attr("target").replace(/#/g , "").split(" ");
        firstWord = $('body w[xml\\:id="' + target[0] + '"]');
        // If word in body
        if($(firstWord).length < 1){
          continue;
        }

        endWord = (target.length > 1) ? $('body w[xml\\:id="' + target[target.length - 1] + '"]') : firstWord;
        corresp = $(words[i]).attr("corresp").replace(/#/g , "").toString();
        para = $(words[i]).parent().toString();

        // If word in body
        prevAllW = $(firstWord).prevAll();
        nextAllW = $(firstWord).nextAll();
        sentence = firstWord;
        //Get only 6 next & prev words
        for(var j = 0 ; j < 6 ; j++){
          prevW  = (prevAllW[j]) ? $(prevAllW[j]).attr("nb" , j+1) : "";
          nextW  = (nextAllW[j]) ? $(nextAllW[j]).attr("nb" , j+1) : "";
          sentence = prevW + sentence + nextW;
        }
        sentence = sentence.toString();

        obj.title = input.basename;
        obj.corresp = corresp;
        obj.target = target;
        obj.sentence = sentence;
        obj.para = para;
        submit(null, obj);
        console.info("obj : " , obj.title , i , "/" , words.length);
      }

      // // Loadash , trie par xml#id + retourne le mot avec espace si besoin  + jointure
      // title = _.chain(list)
      // .sortBy('xml#id')
      // .map(function(chr) {
      //   if(chr["wsAfter"]){
      //     return chr["#text"] + " ";
      //   }
      //   return chr["#text"];
      // })
      // .value()
      // .join("");
      // console.info("title: " , title);

      // ADD title to input
      // objectPath.ensureExists(input, "fields.title", title);
    }
  }
};
