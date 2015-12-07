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
          words = $('spanGrp[type="candidatsTermes"] span').filter('[target],[corresp],[ana~="#DM4"],[ana~="#DAOn"]'),
          firstWord,
          endWord,
          par,
          sentence,
          target,
          prevAllW,
          nextAllW,
          prevW,
          nextW;


      console.info("NB de mots : " , words.length);

      // For each span
      for (var i = 0; i < words.length; i++) {
        target = $(words[i]).attr("target").replace(/#/g , "").split(" ");
        firstWord = $('body w[xml\\:id="' + target[0] + '"]');
        endWord = (target.length > 1)

        // If word in body
        if($(firstWord).length > 0){
          prevAllW = $(firstWord).prevAll();
          // If target uniq
          if(target.length === 1){
            nextAllW = $(firstWord).nextAll();
            sentence = firstWord;
            //Get only 6 next & prev words
            for(i = 0 ; i < 6 ; i++){
              prevW  = (prevAllW[i]) ? $(prevAllW[i]).attr("nb" , i+1) : "";
              nextW  = (nextAllW[i]) ? $(nextAllW[i]).attr("nb" , i+1) : "";
              sentence = prevW + sentence + nextW;
            }
            console.info("Sentence : " , sentence);
            return;
          }
          // If target is composed
          else if(target.length > 1){
            nextAllW = $(firstWord).nextAll();
          }
        }
      };

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
    /************************
     **** NEXT LOADER ****
     ************************/
     submit(null, input);
  }
};
