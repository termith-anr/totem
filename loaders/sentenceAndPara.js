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

  var maxProcess =  config.concurrency || 1,
      delay =  config.delay || 100;

  return function (input, submit) {

    //Load Cheerio on xml DOC input
    var $ = cheerio.load(input.content.xml, {
      normalizeWhitespace: true,
      xmlMode: true
    });
    // Get only span in right spanGrp that have righ attrbs (OBJ)
    var words = $('spanGrp[type="candidatsTermes"] span').filter('[ana~="#DM4"],[ana~="#DAOn"]').toArray();

    if(words.length == "0"){
      return submit(null , input);
    }

    var filtr = $("body div ,text front div[lang='fr'], text front div:not([lang]),  teiHeader fileDesc titleStmt title[lang='fr'], teiHeader fileDesc titleStmt title:not([lang])");

    var attribut;
    $('hi').each(function (i,el) {
      if ($(this).attr('rend')) {
        attribut = $(this).attr('rend');
        $(this).children().each(function () {
          $(this).attr('rend' , attribut);
        });
      }
      $(this).replaceWith($(this).children());
    });
    // Remove big & useless XML in input
    delete input.content.xml;
    var qe;

    // var pause = function (resume) {
    //   clearTimeout(timeoutID);
    //   timeoutID = setTimeout(function() {
    //     if (qe.length() < maxProcess) {
    //       resume();
    //       return;
    //     } else {
    //       pause(resume);
    //     }
    //   }, delay);
    // };
    
    //For each span in file ~ Seems does not work
    async.eachSeries(words, function (word, next) {

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

      var isInFiltr = filtr.find(firstWord).length

      // If word not in body balise continue with other span
      if (isInFiltr < 1) {
        return next();
      }
      // filtr.find('[nb]').removeAttr('nb');

      endWord = (target.length > 1) ? $('w[xml\\:id="' + target[target.length - 1] + '"]') : firstWord;
      corresp = ($(word).attr("corresp") || '').replace(/#entry-/g, "").toString();
      lemma   = ($(word).attr("lemma") || '').toString();

      var nbSiblings = firstWord.siblings();
      var nbParaChildren = firstWord.closest("p").children();

      para = (nbSiblings.length < 11 && nbParaChildren.length > 12) ? nbParaChildren.clone() : firstWord.parent().clone();

      sentence = para.clone();
      sentence.find('note').remove();

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
      }

      /* Create sentence */
      sentence = '<span class="wBefore">' + wBefore + '</span>' + '<span class="candidatsTermes">' + askedWord + '</span>' +  '<span class="wAfter">' + wAfter + '</span>' ;

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

      qe = submit(obj);

      if (qe.length() >= maxProcess) {
        setTimeout(function () {
          return next();
        }, delay * qe.length());
      } else {
        return next();
      }
    },
    function (err) {
      if (err) { 
        console.info(kuler("\n " + err + " \n" , "red")); 
      }
      // the last callback means that all documents have been submitted
      submit();
    })
  }
};
