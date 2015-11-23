var mongo = require("mongodb").MongoClient,
    jsonselect = require('JSONSelect'),
    DOMParser = require('xmldom').DOMParser,
    cheerio = require('cheerio'),
    _ = require("lodash");

module.exports = function(config) {
    
    console.info("collection : " , config.get('connectionURI') , " / " , config.get('collectionName'));

	return function(req,res){

        if(config.get("teiFormat") !== "scenario1" ){
            res.render('index.html', { info : "Impossible d'utiliser TOTEM avec ces fichiers , veuillez préciser le format" });
            return
        }

        if(!req.params.xmlid || (req.params.xmlid === undefined)){
            res.render('index.html', { info : "Aucun ID terme envoyé , merci d'en préciser un" });
        }
        if(!req.params.page || (req.params.page === undefined)){
            res.redirect("/search/" + req.params.xmlid + "/1");
        }

		var xmlid      = req.params.xmlid ? ("\"#entry-" + req.params.xmlid + "\"") : null,
            xmlidRegex = req.params.xmlid ? ".*#DM4.*#entry-" + req.params.xmlid + "| .*#DAOn.*#entry-" + req.params.xmlid: null,
            page = parseInt(req.params.page),
            skip = (Number.isInteger(page) && page > 1) ? (page - 1)*10 +1 : 0 ;

		console.info("Recherche sur l'id : " , xmlid , " , patientez ...");

        var arr = [], // final array containing all objs
            obj = {}, // temps obj use in loop
            title,
            target;

        mongo.connect(config.get('connectionURI'), function(err, db) {
            //console.log("Connected correctly to server");
            db.collection(config.get('collectionName'))
            .aggregate(
               [
                 { $match: { $text: { $search: xmlid } } },
                 { $project : { _id : 0 , basename : 1, text : 1 , "fields.title" : 1 , "content.xml" : 1}},
                 { $unwind : "$text" },
                 { $match : { text : { $regex: xmlidRegex } } },
                 { $skip : skip }, // Should get the number to skip
                 { $limit: 30 } //  Sould Get a limit via ajax
               ]
            )
            .each(function(err, item){
                if(!err && item){
                    console.info("Fichier -> ", item.basename );
                    var dataText = item.text.split("//"),
                        ana      = dataText[1].toLowerCase(),
                        corresp  = dataText[2],
                        target   = (dataText[0].replace("#" , "").split(" ").length > 1) ? dataText[0].replace("#" , "").split(" ")[0] : dataText[0].replace("#" , ""),
                        lemma    = dataText[3];

                    console.info("target : " , target); 

                    // var xmlDoc = new DOMParser().parseFromString(item.content.xml.toString(), 'text/xml'),
                    //     body = xmlDoc.getElementsByTagName('body').toString(),
                    //     w = new DOMParser().parseFromString(body, 'text/xml').getElementsByTagName("w");
                    // console.info("Target -> " , target );

                    var $ = cheerio.load(item.content.xml.toString(), {xmlMode: true}),
                        w = $('body w[xml\\:id="' + target + '"]');
                    
                    if(!w.length > 0 ){
                        console.info('Pas de W dans le body sur ce doc');
                        return;
                    }
                    var word = w.text(),
                        p = w.parent(),
                        prevAllW = w.prevAll(),
                        nextAllW = w.nextAll(),
                        nextW = "",
                        prevW = "",
                        sentence = word
                    console.log("prevAll " , prevAllW.length , " nextAll " , nextAllW.length);

                    for(var i = 0 ; i < 6 ; i++){
                        console.info("i n° " , i);
                        if(prevAllW[i]){
                            console.info("On est dans prevall");
                            prevW = (prevAllW[i].attr("wsAfter") === "true") ? prevAllW[i].text() + " "  :  prevAllW[i].text() ;
                        }
                        if(nextAllW[i]){
                            console.info("On est dans nextvall");
                            nextW = (nextAllW[i].attr("wsAfter") === "true") ? nextAllW[i].text() + " "  :  nextAllW[i].text() ;
                        }
                        sentence = prevW + sentence + nextW;
                    }
                    console.info("sentence : " , sentence);
                    obj = {
                        "word" : [word],
                        "lemma" : lemma,
                        "title" : item.fields.title,
                        "p" : [p],
                        "sentence" : sentence
                    }

                    // for(var i = 0 ; i < w.length ; i++){
                    //     //console.info("id : " , w[i].getAttribute('xml:id'));
                    //     if(w[i].getAttribute('xml:id') === target){
                    //         //console.info("xmlid trouvé  : " , w[i].parentNode.textContent)
                    //         var p  = w[i].parentNode.textContent,
                    //             sentence = w[i-5] + w[i-4] + w[i-3] + w[i-2] + w[i-1]  + w[i] + w[i+1] + w[i+2] + w[i+3] + w[i+4] + w[i+5]
                    //         obj.p.push(p);
                    //         obj.sentence.push(sentence);
                    //         if(obj.word.indexOf(w[i].textContent) === -1){
                    //             obj.word.push(w[i].textContent);
                    //         }
                    //     }
                    // }
                    arr.push(obj);
                    
                }
                else{
                    db.close();
                    if(!err){
                        if(!arr.length > 0){
                            res.render('index.html', { info : "Ce terme n'a pas été desambiguisé Ou la page n'existe pas" });
                            return;
                        }
                        var words = [],
                            lemma = arr[0].lemma;
                        for (var i = 0; i < arr.length; i++) {
                            words = _.union(words , arr[i].word);
                            delete arr[i].word;
                        };
                        arr = _.groupBy(arr, "title");
                        console.info("arrBefore : " , arr);

                        var p = [];
                        _.each(arr , function(element,index){
                            for(i  = 0 ; i < element.length ; i++){
                                p  = _.union(p , element[0].p);
                            }
                            //console.info("Element  : " , element);
                            //onsole.info("p " , p);
                            element["title"] = p;
                            p = [];
                        })
                        console.info("arr : " , arr);
                        console.info("words: " , words);
                        res.render('index.html', { words : words , lemma : lemma , objs : arr });
                    }
                    else{
                        console.info("err : " , err);
                    }
                }
            })

        });

	};
};