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

  var maxProcess  = (config.concurrency)  ? config.concurrency : 2 ,
      delay = config.delay || 100,
      $;
      options = options || {};
      config = config.get() || {};

  return function (input, submit) {
    //Load Cheerio on xml DOC input
    $ = cheerio.load(input.content.xml.toString(), {
      normalizeWhitespace: true,
      xmlMode: true
    });

    // Remove BIG & USELESS XML content
    delete input.content.xml;

    var words = $('spanGrp[type="candidatsTermes"] span').filter('[target],[corresp],[ana~="#DM4"],[ana~="#DAOn"]');

    // For each span in file
    async.each(words , function(word,next){

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
          nextW;

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
      para = $('body w[xml\\:id="' + target[0] + '"]').parent().toString();
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

      // Add elements to OBJ
      obj.content.corresp = corresp;
      obj.content.target = target;
      obj.content.sentence = sentence;
      obj.content.para = para;
      obj.content.lemma = lemma;

      // Check if submited not > processor Nb
      var qeSubmit = submit(obj);
      var timeoutID;

      // console.info(kuler("First Quantity : " + qeSubmit.length()), "violet");

      var delayed = function() {
        // console.info(kuler("Fonction delayed : " + qeSubmit.length()), "cyan");
        clearTimeout(timeoutID);
        // If nb Of submit elements greater than processor nb
        timeoutID = setTimeout(function(){
          // console.info(kuler("Callback de TimeOut : " + qeSubmit.length()), "pink");
          if (qeSubmit.length() < maxProcess) {
            // console.info(kuler("CB timeOut , Ok on peut passer a un autre mot ! : " + qeSubmit.length()), "green");
            next();
          } else {
            // console.info(kuler("CB timeOut , mince Qe trop elevé encore  ... on rappel delayed : " + qeSubmit.length()), "pink");
            delayed();
          }
        }, delay);
      };

      if (qeSubmit.length() >= maxProcess) { 
        // console.info(kuler("Quantité trop élevé detectée , on lance la fonciton delayed : " + qeSubmit.length()), "orange");
        delayed(); 
      }

    },
    function(err){
      // Last callback send all submited elements
      if(!err){
        console.info(kuler("Subdocuments sent !" , "green"));
        submit();
      }
      console.info(kuler(err , "red"));
    })
  }
};
