/**
 *
 * Created by matthias on 14/11/14.
 * Loader to build auto-score
 *
 */

var objectPath = require('object-path');


'use strict';
module.exports = function(options) {
    options = options || {};
    return function (input, submit) {


            if (objectPath.has(input , "content.json.TEI.teiHeader.profileDesc.textClass.keywords") && options.autoScore == true) {

                var arrayMethodsKeywords = [],
                    arrayInistKeywords = [],
                    inistName = "",
                    nbOfMethodlKw = 0,
                    nbOfInistKw = 0,
                    nbOfNotedKw = 0,
                    listOfMethodName = [];

                Object.keys((input.content.json.TEI.teiHeader.profileDesc.textClass.keywords), function (index, valueMethod) {
                    if ((valueMethod.scheme != 'inist-francis') && (valueMethod.scheme != 'inist-pascal') && (valueMethod.scheme != 'cc') && (valueMethod.scheme != 'author') && (valueMethod['xml#lang'] == 'fr')) {
                        var interArrayMethodsKeywords = [];


                        Object.keys(valueMethod.term, function (wordNb, wordValue) {
                            interArrayMethodsKeywords.push(wordValue['#text']);
                        });


                        arrayMethodsKeywords[valueMethod.scheme] = (interArrayMethodsKeywords);

                        nbOfMethodlKw += Object.keys(valueMethod.term).length;

                        listOfMethodName.push(valueMethod.scheme);

                    }

                    else if (((valueMethod.scheme == 'inist-francis') || (valueMethod.scheme == 'inist-pascal')) && valueMethod['xml#lang'] == 'fr') {
                        Object.keys(valueMethod.term, function (wordNb, wordValue) {
                            arrayInistKeywords.push(wordValue['#text']);
                        });

                        inistName = valueMethod.scheme;

                        nbOfInistKw += Object.keys(valueMethod.term).length;

                    }


                });


                Object.keys(arrayMethodsKeywords, function (idArray, value) {
                    var listOfMetKw = value;
                    Object.keys(listOfMetKw, function (idMtWord, valueW) {
                        Object.keys(arrayInistKeywords, function (idInist, valueInist) {
                            if (valueW.toUpperCase() == valueInist.toUpperCase()) {

                                //console.log( 'NOM :', idArray,  'methode : ' , valueW , ' -  Valeur Inist : ' , valueInist);

                                // SI notedKeywords n'existe PAS
                                if ((input.notedKeywords == undefined) || (input.notedKeywords == null)) {

                                    input.notedKeywords = {};
                                    input.notedKeywords[idArray] = {};
                                    input.notedKeywords[inistName] = {};
                                    input.notedKeywords[idArray][valueW] = {
                                        "note": 2
                                    };

                                    for(var i = 0 ; i < listOfMethodName.length ; i++) {
                                        input.notedKeywords[inistName][listOfMethodName[i]] = {};
                                        input.notedKeywords[inistName][listOfMethodName[i]][valueInist] = {
                                            "note": 0
                                        };
                                    }

                                    ++nbOfNotedKw;


                                }
                                // SI notedKewords EXISTE
                                else {

                                    // SI La methode N'EXISTE PAS
                                    if ((input.notedKeywords[idArray] == undefined) || (input.notedKeywords[idArray] == null)) {
                                        input.notedKeywords[idArray] = {};
                                        input.notedKeywords[idArray][valueW] = {
                                            "note": 2
                                        };
                                        ++nbOfNotedKw;

                                    }
                                    // SI La methode existe
                                    else {
                                        input.notedKeywords[idArray][valueW] = {
                                            "note": 2
                                        };
                                        ++nbOfNotedKw;

                                    }


                                    for(var i = 0 ; i < listOfMethodName.length ; i++){

                                        if((input.notedKeywords[inistName][listOfMethodName[i]] == undefined) || (input.notedKeywords[inistName][listOfMethodName[i]] == null)){
                                            input.notedKeywords[inistName][listOfMethodName[i]] = {};
                                        }

                                        input.notedKeywords[inistName][listOfMethodName[i]][valueInist] = {
                                            "note": 0
                                        };

                                    }

                                }


                            }

                        });
                    });
                });

                // Now make the calcul for progress on load

                input.progressNotedKeywords = (nbOfNotedKw / nbOfMethodlKw);
                input.progressSilenceKeywords = (nbOfNotedKw / (nbOfInistKw * 2));

            }
        submit(null, input);
    }
};