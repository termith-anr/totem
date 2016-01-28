/*
 * Created by matthias on 26/10/15.
 * VERSION: Scenario 1
 */
 'use strict';

// Required modules
var cheerio = require('cheerio'),
    clone = require('clone'),
    kuler = require('kuler'),
    async = require('async');

module.exports = function (options, config) {

  options = options || {};
  config = config.get() || {};

  var maxProcess =  1,
      delay =  200;

  return function (input, submit) {

    //Load Cheerio on xml DOC input
    var $ = cheerio.load(input.content.xml, {
      normalizeWhitespace: true,
      xmlMode: true
    });
    // Get only span in right spanGrp that have righ attrbs (OBJ)
    var wordsObj = $('spanGrp[type="candidatsTermes"] span').filter('[ana~="#DM4"],[ana~="#DAOn"]');
    // Remove big & useless XML in input
    delete input.content.xml;

    //For each span in file ~ Seems does not work
    async.forEachOfSeries(wordsObj, function (word, key, next) {

      // Build clone of input file
      var obj = clone(input,false);

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
          wBefore = "",
          wAfter = "",
          askedWord = "";

      target = ($(word).attr("target") || '').replace(/#/g , "").split(" ");
      firstWord = $('w[xml\\:id="' + target[0] + '"]');

      var filtr = $("body div ,text front div[lang='fr'], text front div:not([lang]),  teiHeader fileDesc titleStmt title[lang='fr'], teiHeader fileDesc titleStmt title:not([lang])");
      var isInFiltr = filtr.find(firstWord).length

      // If word not in body balise continue with other span
      if (isInFiltr < 1) {
        return next();
      }
      // filtr.find('[nb]').removeAttr('nb');

      endWord = (target.length > 1) ? $('w[xml\\:id="' + target[target.length - 1] + '"]') : firstWord;
      corresp = ($(word).attr("corresp") || '').replace(/#entry-/g, "").toString();
      lemma   = ($(word).attr("lemma") || '').toString();

      var nbSiblings = firstWord.siblings().length;
      var nbParaChildren = firstWord.closest("p").children().length;

      para = (nbSiblings < 11 && nbParaChildren > 12) ? firstWord.closest("p").clone() : firstWord.parent().clone();

      var attribut;
      para.find('hi').each(function (i,el) {
        if (para.find(this).attr('rend')) {
          attribut = para.find(this).attr('rend');
          para.find(this).children().each(function () {
            para.find(this).attr('rend' , attribut);
          });
        }
        para.find(this).replaceWith(para.find(this).children());
      });
      sentence = para.clone();

      prevAllW = sentence.find('w[xml\\:id="' + target[0] + '"]').prevAll();
      nextAllW = sentence.find('w[xml\\:id="' + target[target.length - 1] + '"]').nextAll();


      //Create asked words and add attribut nb
      for (var i = 0 ; i < target.length ; i++) {
        askedWord = askedWord + para.find('w[xml\\:id="' + target[i] + '"]').attr("nb" , "0");
      }


      for (var nbWBefore = 0, nbWAfter = 0, index = 0; (nbWBefore < 5 || nbWAfter < 5) ; index++) {
        prevW = (prevAllW[index]) ? prevAllW.filter(prevAllW[index]) : null;
        nextW = (nextAllW[index]) ? nextAllW.filter(nextAllW[index]) : null;
        if(prevW){
          if(prevW.is('w')){
            prevW = prevW.attr("nb", ++nbWBefore);
          }
          if (!(prevW.is('note'))) {
            wBefore = prevW + wBefore ;
          }
        }
        else{
          nbWBefore = 5;
        }

        if(nextW){
          if(nextW.is('w')){
            nextW = nextW.attr("nb", ++nbWAfter);
          }
          if (!(nextW.is('note'))) {
            wAfter = wAfter + nextW ;
          }
        }
        else{
          nbWAfter = 5;
        }
      };

      /* Create sentence */
      sentence = '<span class="wBefore">' + wBefore + '</span>' + '<span class="candidatsTermes">' + askedWord + '</span>' +  '<span class="wAfter">' + wAfter + '</span>' ;
      sentence = cheerio.load(sentence);
      sentence('note').remove();
      sentence = sentence.xml().toString();

      para = para.toString();
      para = para.replace(/<head/g, "<div");
      para = para.replace(/<\/head>/g, "</div>");
      para = para.replace(/<title/g, "<h4");
      para = para.replace(/<\/title>/g, "</h4>");
      para = para.replace(/<hi/g, "<i");
      para = para.replace(/<\/hi>/g, "</i>");
      para = para.replace(/<note/g, "<div");
      para = para.replace(/<\/note>/g, "</div>");

      // Add elements to OBJ
      obj.content.corresp = corresp;
      obj.content.target = target;
      obj.content.sentence = sentence;
      obj.content.para = para;
      obj.content.lemma = lemma;
      obj.content.words = askedWord.toString();

      var qe, timeoutID;

      var pause = function (resume) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(function() {
          if (qe.length() < maxProcess) {
            resume();
            return;
          } else {
            pause(resume);
          }
        }, delay);
      };

      qe = submit(obj);

      if (qe.length() >= maxProcess) {
        pause(next);
      } else {
        next();
        return;
      }
    },
    function (err) {
      if (err) { 
        console.info(kuler("\n " + err + " \n" , "red")); 
        return
      }
      // the last callback means that all documents have been submitted
      submit();
    });
  }
};
