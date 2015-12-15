var mongo = require("mongodb").MongoClient,
    _ = require("lodash");

module.exports = function(config) {
    
    console.info("collection : " , config.get('connectionURI') , " / " , config.get('collectionName'));

	return function(req,res){

        if(config.get("teiFormat") !== "scenario1" ){
            res.render('index.html', { info : "Impossible d'utiliser TOTEM avec ces fichiers , veuillez préciser le format" });
            return
        }

        if(!req.params.xmlid || (req.params.xmlid === undefined)){
            res.render('index.html');
            return;
        }
        if(!req.params.page || (req.params.page === undefined)){
            console.info("redirection ...");
            res.redirect("/search/" + req.params.xmlid + "/1");
            return;
        }

		var xmlid      = req.params.xmlid ? ("\"#entry-" + req.params.xmlid + "\"") : null,
            xmlidRegex = req.params.xmlid ? ".*#DM4.*#entry-" + req.params.xmlid + "| .*#DAOn.*#entry-" + req.params.xmlid: null,
            page = req.params.page ?  parseInt(req.params.page)  : 1,
            skip = (Number.isInteger(page) && page > 1) ? (page - 1)*50 +1 : 0 ;

        console.info("Recherche sur l'id : " , xmlid , " , patientez ..." , "page nb : " , req.params.page);
        console.info("skip : " , skip);


        var arr = [], // final array containing all objs
            obj = {}, // temps obj use in loop
            title,
            target;

        mongo.connect(config.get('connectionURI'), function(err, db) {
            //console.log("Connected correctly to server");
            db.collection(config.get('collectionName'))
            // .aggregate(
            //    [
            //      { $match: { $text: { $search: xmlid } } },
            //      { $project : { _id : 0 , basename : 1, text : 1 , "fields.title" : 1 , "content.xml" : 1 , wid : 1}},
            //      { $unwind : "$text" },
            //      { $match : { text : { $regex: xmlidRegex } } },
            //      { $skip : skip }, // Should get the number to skip
            //      { $limit: 50 } //  Sould Get a limit via ajax
            //    ]
            // )
            .find({"content.corresp" : req.params.xmlid } , {content : 1 , basename : 1})
            .each(function(err, item){
                if(!err && item){
                    console.info("Fichier -> ", item.basename );
                    var dataText = item.text.split("//"),
                        ana      = dataText[1].toLowerCase(),
                        corresp  = dataText[2],
                        target   = (dataText[0].replace("#" , "").split(" ").length > 1) ? dataText[0].replace("#" , "").split(" ")[0] : dataText[0].replace("#" , ""),
                        lemma    = dataText[3];

                    console.info("target : " , target); 

                    var $ = cheerio.load(item.content.xml.toString(), {xmlMode: true}),
                        w = $('body w[xml\\:id="' + target + '"]');
                    
                    if(!w.length > 0 ){
                        console.info('Pas de W dans le body sur ce doc');
                        return;
                    }

                    var word = w.attr("nb" , 0),
                        p = w.parent(),
                        prevAllW = w.prevAll(),
                        nextAllW = w.nextAll(),
                        nextW = "",
                        prevW = "",
                        sentence = word,
                        classW;

                    //console.info("prevAll " , prevAllW.length , " nextAll " , nextAllW.length);

                    for(i = 0 ; i < 6 ; i++){
                        //console.info("i n° " , i , " prevvI : " , prevAllW[i]);
                        // if(prevAllW[i]){
                        //     console.info("On est dans prevall");
                        //     prevW = ($(prevAllW[i]).attr("wsAfter") === "true") ? $(prevAllW[i]).text() + " "  :  $(prevAllW[i]).text() ;
                        // }
                        // if(nextAllW[i]){
                        //     console.info("On est dans nextvall");
                        //     nextW = ($(nextAllW[i]).attr("wsAfter") === "true") ? $(nextAllW[i]).text() + " "  :  $(nextAllW[i]).text() ;
                        // }
                        prevW  = (prevAllW[i]) ? $(prevAllW[i]).attr("nb" , i+1) : "";
                        nextW  = (nextAllW[i]) ? $(nextAllW[i]).attr("nb" , i+1) : "";
                        sentence = prevW + sentence + nextW;
                    }
                    obj = {
                        "wid" : item.wid,
                        "target" : target,
                        "word" : [word],
                        "lemma" : lemma,
                        "title" : item.fields.title,
                        "p" : [p],
                        "sentence" : sentence
                    }
                    
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
                        res.render('index.html', { page : page , id : req.params.xmlid,  words : words , lemma : lemma , objs : arr });
                    }
                    else{
                        console.info("err : " , err);
                    }
                }
            })

        });

	};
};