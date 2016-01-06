/*
 * Created by matthias on 26/02/15.
 * VERSION: Scenario 1
 */
 'use strict';

// Required modules
var objectPath = require('object-path'),
    sha1 = require('sha1'),
    cheerio = require('cheerio'),
    clone = require('clone'),
    kuler = require('kuler'),
    async = require('async'),
    _ = require('lodash');

module.exports = function(options,config) {

  console.info("passage export");

  options = options || {};
  config = config.get() || {};

  var maxProcess  =  1 ,
      delay =  200;

  return function (input, submit) {

      // console.info("RETURN FUNCTION pour : " , config.concurrency);

    //Load Cheerio on xml DOC input
    var xml = cheerio.load(input.content.xml.toString(), {
      normalizeWhitespace: true,
      xmlMode: true
    });

    var wordsObj = xml('spanGrp[type="candidatsTermes"] span').filter('[target],[corresp],[ana~="#DM4"],[ana~="#DAOn"]'),
        words = [];

    for (var i = 0; i < wordsObj.length ; i++) {
      words[i] = wordsObj[i];
    }
    // console.info("words : " , words.length);

    //For each span in file ~ Seems does not work
    async.eachSeries(words , function(word,next){

      // Build clone of input file
      var obj = clone(input,false);

      var $ = cheerio.load(obj.content.xml.toString(), {
        normalizeWhitespace: true,
        xmlMode: true
      });

      var firstWord,
          endWord,
          para,
          sentence,
          target,
          corresp,
          lemma,
          prevAllW,
          nextAllW,
          prevW,
          nextW,
          askedWord = "";

      target = $(word).attr("target").replace(/#/g , "").split(" ");
      firstWord = $('w[xml\\:id="' + target[0] + '"]');

      // console.info("passage n° " + words.indexOf(word) + " pour " + input.basename );

      // If word not in body balise continue with other span
      if($(firstWord).length < 1){
        // console.info(kuler("On ne traite pas " + words.indexOf(word) , "red") + "/" + words.length + " pour " + input.basename);
        next();
        return;
      }

      // console.info(kuler("On traite " + words.indexOf(word) , "green") + "/" + words.length + " pour " + input.basename);


      

      endWord = (target.length > 1) ? $('w[xml\\:id="' + target[target.length - 1] + '"]') : firstWord;
      corresp = $(word).attr("corresp").replace(/#entry-/g , "").toString();
      lemma   = $(word).attr("lemma").toString();
      para = (($('w[xml\\:id="' + target[0] + '"]').parent().children().length < 12) && ($('w[xml\\:id="' + target[0] + '"]').closest("p").children().length > 12)) ?  $('w[xml\\:id="' + target[0] + '"]').closest("p") :  $('w[xml\\:id="' + target[0] + '"]').parent();
      prevAllW = $(firstWord).prevAll();
      nextAllW = $(firstWord).nextAll();

      //Create asked words and add attribut nb
      for(var i = 0 ; i < target.length ; i++){
        askedWord = askedWord + $('w[xml\\:id="' + target[i] + '"]').attr("nb" , "0");
        $('w[xml\\:id="' + target[i] + '"]' , para).attr("nb" , "0");
        // console.info("nom : ",  input.basename , "corresp : "  , corresp , "i : " ,  i  , "  target  :  " , target[i] , " askedWord : " , askedWord);
      }

      sentence = askedWord;
      para = para.toString();
      para = para.replace(/<head/g, "<div");
      para = para.replace(/<\/head>/g, "</div>");
      para = para.replace(/<title/g, "<h4");
      para = para.replace(/<\/title>/g, "</h4>");
      para = para.replace(/<hi/g, "<i");
      para = para.replace(/<\/hi>/g, "</i>");
      para = para.replace(/<note/g, "<div");
      para = para.replace(/<\/note>/g, "</div>");

      // console.info("Asked words : " , askedWord);

      //Get only 6 next & prev words
      for(var j = 0 ; j < 6 ; j++){
        prevW  = (prevAllW[j]) ? $(prevAllW[j]).attr("nb" , j+1) : "";
        nextW  = (nextAllW[j]) ? $(nextAllW[j]).attr("nb" , j+1) : "";
        sentence = prevW + sentence + nextW;
      }


      sentence = sentence.toString();

      // Add elements to OBJ
      obj.content.corresp = corresp;
      obj.content.target = target;
      obj.content.sentence = sentence;
      obj.content.para = para;
      obj.content.lemma = lemma;
      obj.content.words = askedWord.toString();
      obj.content.nb = obj.fid + "" + words.indexOf(word) ;

      // Remove BIG & USELESS XML content
      delete obj.content.xml;

      var qe,
          timeoutID;

      var pause = function (resume) {
        // console.info(kuler("Fonction pause " + qe.length() + " / " + obj.basename , "orange"));
        clearTimeout(timeoutID);
        timeoutID = setTimeout(function() {
            if (qe.length() < maxProcess) {
              // console.info(kuler("On peut continuer : " + qe.length() + " / " + obj.basename , "green"));
              resume();
            } else {
              // console.info(kuler("On doit pausé : " + qe.length() + " / " + obj.basename , "red"));
              pause(resume);
            }
        }, delay);
      };

      qe = submit(obj);
      if (qe.length() >= maxProcess) {
        // console.info(kuler("On lance fonction pause pour " + obj.basename + " length : " + qe.length() , "blue"));
        pause(next);
      }
    },
    function(err){
      // Last callback send all submited elements
      if(!err){
        // console.info(kuler("Subdocuments sent !" + " pour " + input.basename, "green"));
        submit();
      }
      console.info(kuler(err , "red"));
    });
  }
};
