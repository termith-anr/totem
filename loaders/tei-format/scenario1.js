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

    var words = $('spanGrp[type="candidatsTermes"] span').filter('[target],[corresp],[ana~="#DM4"],[ana~="#DAOn"]'),
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

    // For each span in file
    async.each(words , function(word,next){

      //Call next element
      next();
    }, 
    function(err){
      // Last callback send all submited elements
      if(!err){
        console.info(kuler("Subdocuments sent !" , "green"));
        submit();
        return;
      }
      console.info(kuler(err , "red"));
    })

    for (var i = 0; i < words.length; i++) {
      target = $(words[i]).attr("target").replace(/#/g , "").split(" ");
      firstWord = $('body w[xml\\:id="' + target[0] + '"]');

      // If word not in body balise continue with other span
      if($(firstWord).length < 1){
        continue;
      }

      // Build clone of input file
    var obj = clone(input,false);

      endWord = (target.length > 1) ? $('body w[xml\\:id="' + target[target.length - 1] + '"]') : firstWord;
      corresp = $(words[i]).attr("corresp").replace(/#/g , "").toString();
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
      obj.title = input.basename;
      obj.corresp = corresp;
      obj.target = target;
      obj.sentence = sentence;
      obj.para = para;

      // Remove BIG & USELESS XML content
      delete obj.content.xml;

      // Check if submited not > processor Nb
      var qeSubmit = submit(obj , function(){
        delayed();
      });

      var delayed = function() {
        // If nb Of submit elements greater than processor nb
        if (qeSubmit.length() > maxProcess) {
          setTimeout(delayed, delay);
        }
      }

      console.info(kuler(i , "orange") + '  / ' +  words.length + ' sent \r');
    }
    submit();
  }
};
