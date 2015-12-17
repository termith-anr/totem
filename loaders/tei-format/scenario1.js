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
    _ = require('lodash'),
    wait = require('wait');

module.exports = function(options,config) {

  var maxProcess  = (config.concurrency)  ? config.concurrency : 1 ,
      delay = config.delay || 100;
      options = options || {};
      config = config.get() || {};

  return function (input, submit) {
    //Load Cheerio on xml DOC input
    var $ = cheerio.load(input.content.xml.toString(), {
      normalizeWhitespace: true,
      xmlMode: true
    });

    // Remove BIG & USELESS XML content
    delete input.content.xml;

    var wordsObj = $('spanGrp[type="candidatsTermes"] span').filter('[target],[corresp],[ana~="#DM4"],[ana~="#DAOn"]'),
        words = [];

    for (var i = 0; i < wordsObj.length ; i++) {
      words[i] = wordsObj[i];
    }
    // console.info("words : " , words.length);

    //For each span in file ~Seems does not work
    async.eachSeries(words , function(word,next){

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
      firstWord = $('body w[xml\\:id="' + target[0] + '"]');

      // If word not in body balise continue with other span
      if($(firstWord).length < 1){
        next();
        return;
      }

      // Build clone of input file
      var obj = clone(input,false);

      endWord = (target.length > 1) ? $('body w[xml\\:id="' + target[target.length - 1] + '"]') : firstWord;
      corresp = $(word).attr("corresp").replace(/#entry-/g , "").toString();
      lemma   = $(word).attr("lemma").toString();
      para = $('body w[xml\\:id="' + target[0] + '"]').parent();
      prevAllW = $(firstWord).prevAll();
      nextAllW = $(firstWord).nextAll();

      //Create asked words and add attribut nb
      for(var i = 0 ; i < target.length ; i++){
        askedWord = askedWord + $('body w[xml\\:id="' + target[i] + '"]').attr("nb" , "0");
        $('w[xml\\:id="' + target[i] + '"]' , para).attr("nb" , "0");
        console.info("nom : ",  input.basename , "corresp : "  , corresp , "i : " ,  i  , "  target  :  " , target[i] , " askedWord : " , askedWord);

      }

      sentence = askedWord;
      para = para.toString();

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

      var qe,
          timeoutID;

      var pause = function (resume) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(function() {
            if (qe.length() < maxProcess) {
              resume();
            } else {
              pause(resume);
            }
        }, delay);
      };

      qe = submit(obj);
      // console.info("Target envoyé : " , obj.content.target  , "(" , obj.basename , ")");
      if (qe.length() >= maxProcess) {
        pause(next);
      }
    },
    function(err){
      // Last callback send all submited elements
      if(!err){
        // console.info(kuler("Subdocuments sent !" , "green"));
        submit();
        return;
      }
      console.info(kuler(err , "red"));
    });
  }
};
