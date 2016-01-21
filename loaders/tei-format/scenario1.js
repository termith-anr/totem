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

  var maxProcess = config.concurrency || 1,
      delay =  config.delay || 200;

  return function (input, submit) {

    //Load Cheerio on xml DOC input
    var xml = cheerio.load(input.content.xml.toString(), {
      normalizeWhitespace: true,
      xmlMode: true
    });

    var wordsObj = xml('spanGrp[type="candidatsTermes"] span').filter('[ana~="#DM4"],[ana~="#DAOn"]');

    delete input.content.xml;

    // for (var i = 0; i < wordsObj.length ; i++) {
    //   words[i] = wordsObj[i];
    // }

    //For each span in file ~ Seems does not work
    async.forEachOfSeries(wordsObj, function (word, key, next) {

      // Build clone of input file
      var obj = clone(input,false);

      var $ = clone(xml, false);

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

      var isInFiltr = $("body div ,text front div[lang='fr'], text front div:not([lang]),  teiHeader fileDesc titleStmt title[lang='fr'], teiHeader fileDesc titleStmt title:not([lang])").find(firstWord).length

      // If word not in body balise continue with other span
      if (isInFiltr < 1) {
        return next();
      }

      endWord = (target.length > 1) ? $('w[xml\\:id="' + target[target.length - 1] + '"]') : firstWord;
      corresp = ($(word).attr("corresp") || '').replace(/#entry-/g, "").toString();
      lemma   = ($(word).attr("lemma") || '').toString();

      var nbSiblings = firstWord.siblings().length;
      var nbParaChildren = firstWord.closest("p").children().length;

      para = (nbSiblings < 11 && nbParaChildren > 12) ? firstWord.closest("p") : firstWord.parent();

      $('hi').each(function (i,el) {
        if ($(this).attr('rend')) {
          var attribut = $(this).attr('rend');
          $(this).children().each(function () {
            $(this).attr('rend' , attribut);
          });
        }
        $(this).replaceWith($(this).children());
      });

      prevAllW = $(firstWord).prevAll();
      nextAllW = $(endWord).nextAll();

      //Create asked words and add attribut nb
      for (var i = 0 ; i < target.length ; i++) {
        askedWord = askedWord + $('w[xml\\:id="' + target[i] + '"]').attr("nb" , "0");
        $('w[xml\\:id="' + target[i] + '"]').attr("nb" , "0");
      }
      askedWord = askedWord + "</span>";

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

      for (var nbWBefore = 0, nbWAfter = 0, index = 0; (nbWBefore < 5 || nbWAfter < 5) ; index++) {
        prevW = $(prevAllW[index]);
        nextW = $(nextAllW[index]);
        if(prevW.length){
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

        if(nextW.length){
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

      sentence = '<span class="wBefore">' + wBefore + '</span>' + '<span class="candidatsTermes">' + askedWord + '</span>' +  '<span class="wAfter">' + wAfter + '</span>' ;
      sentence = cheerio.load(sentence);
      sentence('note').remove();
      sentence = sentence.xml().toString();

      // Add elements to OBJ
      obj.content.corresp = corresp;
      obj.content.target = target;
      obj.content.sentence = sentence;
      obj.content.para = para;
      obj.content.lemma = lemma;
      obj.content.words = askedWord.toString();
      // obj.content.nb = obj.fid + "" + wordsObj.indexOf(word) ;

      // Remove BIG & USELESS XML content
      // delete obj.content.xml;

      var qe, timeoutID;

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

      if (qe.length() >= maxProcess) {
        pause(next);
      } else {
        next();
      }
    },
    function (err) {
      if (err) { console.info(kuler(err , "red")); }

      // the last callback means that all documents have been submitted
      submit();
    });
  }
};
