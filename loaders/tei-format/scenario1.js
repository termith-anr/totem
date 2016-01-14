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
    clone = require('clone'),
    _ = require('lodash');

module.exports = function(options,config) {

  console.info("passage export");

  options = options || {};
  config = config.get() || {};

  var maxProcess  =  1 ,
      delay =  200;

  return function (input, submit) {

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
          wBefore="",
          wAfter="",
          askedWord = "<span class='candidatsTermes'>";

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
      
      $('hi').each(function(i,el){
        if($(this).attr('rend')){
          var attribut = $(this).attr('rend');
          $(this).children().each(function(){
            $(this).attr('rend' , attribut);
          });
        }
        $(this).replaceWith($(this).children());
      });

      prevAllW = $(firstWord).prevAll();
      nextAllW = $(endWord).nextAll();

      //Create asked words and add attribut nb
      for(var i = 0 ; i < target.length ; i++){
        askedWord = askedWord + $('w[xml\\:id="' + target[i] + '"]').attr("nb" , "0");
        $('w[xml\\:id="' + target[i] + '"]').attr("nb" , "0");
        // console.info("nom : ",  input.basename , "corresp : "  , corresp , "i : " ,  i  , "  target  :  " , target[i] , " askedWord : " , askedWord);
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

      wBefore = '</span>';

      var i , j = 0;
      do{
        // Si element exist
        if(prevAllW[j]){
          
          prevW = $(prevAllW[j]);
          //If its a word

          if(prevW.is('w')){
            prevW = prevW.attr("nb" , j+1);
            wBefore = prevW + wBefore;
            i++;
          }
          else if(!(prevW.is('note'))){
            wBefore = prevW + wBefore ;
          }
          j++;
        }
        else{
          break;
        }
      }while(i < 6)

      sentence = '<span class="wBefore">' + wBefore + sentence ;

      wAfter = '<span class="wAfter">'
      i = 0;
      j = 0;
      do{
        // Si element exist
        if(nextAllW[j]){
          
          nextW = $(nextAllW[j]);
          //If its a word
          if(nextW.is('w')){
            nextW = nextW.attr("nb" , j+1);
            wAfter = wAfter + nextW;
            i++;
          }
          else if(!(nextW.is('note'))){
            wAfter = wAfter + nextW;
          }
          j++;
        }
        else{
          break;
        }
      }while(i < 6)

      sentence =  sentence + wAfter + '</span>';

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
      console.info("qe : " , qe.length());
      if (qe.length() >= maxProcess) {
        // console.info(kuler("On lance fonction pause pour " + obj.basename + " length : " + qe.length() , "blue"));
        pause(next);
      }
    },
    function(err){
      // Last callback send all submited elements
      if(!err){
        console.info(kuler("Subdocuments sent !" + " pour " + input.basename, "green"));
        submit();
      }
      console.info(kuler(err , "red"));
    });
  }
};
